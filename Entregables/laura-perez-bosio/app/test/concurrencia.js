// Prueba de concurrencia sobre el checkout.
//
// Simula N compradores intentando comprar la MISMA ultima unidad exactamente
// al mismo tiempo. Solo uno deberia lograrlo: el resto tiene que recibir el
// aviso de falta de stock, y el stock nunca puede quedar negativo.
//
// Uso:
//   1. Levantar la app:   docker compose up -d
//   2. Dejar 1 sola unidad del producto de prueba:
//      docker exec shibashop-db psql -U shibashop -d shibashopdb \
//        -c "UPDATE productos SET stock = 1 WHERE id = 4;"
//   3. Correr:            node test/concurrencia.js

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const PRODUCTO_ID = 4;      // Monitor 27 pulgadas
const COMPRADORES = 25;

async function prepararComprador(n) {
  // Cada comprador tiene su propia sesion, con el producto ya en el carrito.
  const res = await fetch(`${BASE}/carrito/agregar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `producto_id=${PRODUCTO_ID}`,
    redirect: 'manual',
  });
  const setCookie = res.headers.getSetCookie?.() || [];
  return { n, cookie: setCookie.map((c) => c.split(';')[0]).join('; ') };
}

async function confirmar({ n, cookie }) {
  const res = await fetch(`${BASE}/carrito/confirmar`, {
    method: 'POST',
    headers: { Cookie: cookie },
    redirect: 'manual',
  });
  const location = res.headers.get('location') || '';
  if (location.includes('pedido=')) {
    return { n, resultado: 'COMPRO', detalle: 'pedido #' + location.split('pedido=')[1] };
  }
  if (location.includes('error=')) {
    return { n, resultado: 'RECHAZADO', detalle: decodeURIComponent(location.split('error=')[1]) };
  }
  return { n, resultado: 'OTRO', detalle: location || `HTTP ${res.status}` };
}

(async () => {
  console.log(`Preparando ${COMPRADORES} compradores, cada uno con el producto en su carrito...`);
  const compradores = await Promise.all(
    Array.from({ length: COMPRADORES }, (_, i) => prepararComprador(i + 1))
  );

  console.log('Disparando las confirmaciones TODAS AL MISMO TIEMPO...\n');
  const t0 = Date.now();
  const resultados = await Promise.all(compradores.map(confirmar));
  const ms = Date.now() - t0;

  const compraron = resultados.filter((r) => r.resultado === 'COMPRO');
  const rechazados = resultados.filter((r) => r.resultado === 'RECHAZADO');
  const otros = resultados.filter((r) => r.resultado === 'OTRO');

  console.log(`Compraron:  ${compraron.length}`);
  console.log(`Rechazados: ${rechazados.length}`);
  console.log(`Otros:      ${otros.length}`);
  console.log(`Tiempo total: ${ms} ms\n`);

  if (compraron.length) console.log('Ganador:', compraron.map((r) => `#${r.n} (${r.detalle})`).join(', '));
  if (rechazados.length) console.log('Motivo del rechazo:', rechazados[0].detalle);

  console.log('\n' + (compraron.length === 1
    ? 'RESULTADO: CORRECTO — exactamente una compra prospero.'
    : `RESULTADO: FALLA — prosperaron ${compraron.length} compras sobre 1 unidad de stock.`));

  process.exit(compraron.length === 1 ? 0 : 1);
})();
