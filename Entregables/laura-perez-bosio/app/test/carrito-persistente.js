// Prueba que el carrito sobrevive a la caida de la instancia que lo atendio.
//
// Con el carrito en la memoria del servidor, reiniciar el proceso lo borraba.
// Al guardarlo en la base y dejar solo el token en una cookie firmada, el
// carrito sigue ahi. Es el equivalente local a que el Auto Scaling de baja una
// instancia en AWS.
//
// Uso:
//   1. docker compose up -d
//   2. node test/carrito-persistente.js

const { execSync } = require('child_process');
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const cookiesDe = (res) =>
  (res.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');

async function agregar(productoId, cookie) {
  const res = await fetch(`${BASE}/carrito/agregar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...(cookie ? { Cookie: cookie } : {}) },
    body: `producto_id=${productoId}`,
    redirect: 'manual',
  });
  return cookie || cookiesDe(res);
}

async function verCarrito(cookie) {
  const res = await fetch(`${BASE}/carrito`, { headers: { Cookie: cookie } });
  const html = await res.text();
  const filas = [...html.matchAll(/<td>([^<]+)<\/td>/g)].map((m) => m[1]);
  return filas.filter((f) => !f.startsWith('$'));
}

async function esperarApp(intentos = 30) {
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

(async () => {
  console.log('1. Agregando dos productos al carrito...');
  const cookie = await agregar(1, null);
  await agregar(4, cookie);
  const antes = await verCarrito(cookie);
  console.log('   Carrito:', antes.join(' | '));

  console.log('\n2. Reiniciando el contenedor de la app (simula perder la instancia)...');
  execSync('docker restart shibashop-app', { stdio: 'ignore' });
  const listo = await esperarApp();
  console.log('   App', listo ? 'de vuelta en linea' : 'NO respondio');

  console.log('\n3. Consultando el carrito con la MISMA cookie...');
  const despues = await verCarrito(cookie);
  console.log('   Carrito:', despues.length ? despues.join(' | ') : '(vacio)');

  const sobrevivio = despues.length === antes.length && despues.every((p, i) => p === antes[i]);
  console.log(
    '\n' +
      (sobrevivio
        ? 'RESULTADO: CORRECTO — el carrito sobrevivio a la caida de la instancia.'
        : 'RESULTADO: FALLA — el carrito se perdio al reiniciar.')
  );
  process.exit(sobrevivio ? 0 : 1);
})();
