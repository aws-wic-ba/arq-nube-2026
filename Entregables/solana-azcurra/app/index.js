const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
app.use(express.urlencoded({ extended: false }));

const MATERIALES = {
  plastico: '♻️ Plástico',
  papel_carton: '📦 Papel/Cartón',
  vidrio: '🫙 Vidrio',
};

// Evita que texto ingresado por el usuario rompa el HTML
function esc(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pagina(titulo, cuerpo, mensaje) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>EcoCanje</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f4faf4; color: #1b3a1b; }
    nav { background: #2e7d32; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
    nav a { color: white; text-decoration: none; margin-right: 16px; font-weight: bold; }
    h1 { color: #2e7d32; }
    .tarjeta { background: white; border: 1px solid #cde5cd; border-radius: 8px; padding: 14px; margin-bottom: 10px; }
    .mensaje { background: #fff3cd; border: 1px solid #ffe08a; border-radius: 8px; padding: 10px; margin-bottom: 16px; }
    button { background: #2e7d32; color: white; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; }
    select, input { padding: 6px; border-radius: 6px; border: 1px solid #aaa; }
    .finalizada { color: #2e7d32; font-weight: bold; }
    .puntos { background: #e8f5e9; border-radius: 6px; padding: 2px 8px; font-weight: bold; }
    form.inline { display: inline; }
  </style>
</head>
<body>
  <nav>
    <a href="/">📋 Publicaciones</a>
    <a href="/canje">🎁 Canje de puntos</a>
  </nav>
  <h1>${titulo}</h1>
  ${mensaje ? `<div class="mensaje">${esc(mensaje)}</div>` : ''}
  ${cuerpo}
</body>
</html>`;
}

// ---------- Página 1: publicaciones de material ----------

app.get('/', async (req, res) => {
  const vecinos = await pool.query('SELECT * FROM vecinos ORDER BY nombre');
  const publicaciones = await pool.query(
    `SELECT p.*, v.nombre AS vecino
     FROM publicaciones p JOIN vecinos v ON v.id = p.vecino_id
     ORDER BY p.id DESC`
  );

  const opcionesVecinos = vecinos.rows
    .map((v) => `<option value="${v.id}">${esc(v.nombre)}</option>`)
    .join('');

  const formulario = `
    <div class="tarjeta">
      <h3>Publicar material</h3>
      <form method="POST" action="/publicar">
        <select name="vecino_id" required>${opcionesVecinos}</select>
        <select name="material" required>
          <option value="plastico">Plástico</option>
          <option value="papel_carton">Papel/Cartón</option>
          <option value="vidrio">Vidrio</option>
        </select>
        <button>Publicar</button>
      </form>
      <p><small>Una publicación por tipo de material. Cada transacción finalizada suma 5 puntos.</small></p>
    </div>`;

  const lista = publicaciones.rows
    .map((p) => {
      let acciones = '';
      if (p.estado === 'publicada') {
        acciones = `
          <form class="inline" method="POST" action="/responder/${p.id}">
            <input name="emprendedor" placeholder="Nombre del emprendedor" required>
            <button>Responder (recolectar)</button>
          </form>`;
      } else if (p.estado === 'en_proceso') {
        acciones = `
          Recolecta: <b>${esc(p.emprendedor)}</b> —
          <form class="inline" method="POST" action="/confirmar/${p.id}">
            <button name="quien" value="vecino" ${p.confirmo_vecino ? 'disabled' : ''}>
              ${p.confirmo_vecino ? '✓ Vecino confirmó' : 'Confirmar (vecino)'}
            </button>
            <button name="quien" value="emprendedor" ${p.confirmo_emprendedor ? 'disabled' : ''}>
              ${p.confirmo_emprendedor ? '✓ Emprendedor confirmó' : 'Confirmar (emprendedor)'}
            </button>
          </form>`;
      } else {
        acciones = `<span class="finalizada">✓ Finalizada — ${esc(p.emprendedor)} retiró el material (+5 puntos)</span>`;
      }
      return `<div class="tarjeta">
        <b>${MATERIALES[p.material]}</b> — publicado por ${esc(p.vecino)}<br>${acciones}
      </div>`;
    })
    .join('');

  res.send(pagina('Publicaciones de material', formulario + (lista || '<p>Todavía no hay publicaciones.</p>'), req.query.msg));
});

app.post('/publicar', async (req, res) => {
  await pool.query('INSERT INTO publicaciones (vecino_id, material) VALUES ($1, $2)', [
    req.body.vecino_id,
    req.body.material,
  ]);
  res.redirect('/?msg=' + encodeURIComponent('Publicación creada'));
});

app.post('/responder/:id', async (req, res) => {
  await pool.query(
    `UPDATE publicaciones SET emprendedor = $1, estado = 'en_proceso' WHERE id = $2 AND estado = 'publicada'`,
    [req.body.emprendedor, req.params.id]
  );
  res.redirect('/?msg=' + encodeURIComponent('El emprendedor respondió la publicación'));
});

app.post('/confirmar/:id', async (req, res) => {
  const columna = req.body.quien === 'vecino' ? 'confirmo_vecino' : 'confirmo_emprendedor';
  const cliente = await pool.connect();
  try {
    // Transacción: los 5 puntos se acreditan solo cuando confirman las DOS partes, y una sola vez
    await cliente.query('BEGIN');
    const resultado = await cliente.query(
      `UPDATE publicaciones SET ${columna} = TRUE WHERE id = $1 AND estado = 'en_proceso' RETURNING *`,
      [req.params.id]
    );
    const p = resultado.rows[0];
    let msg = 'Confirmación registrada. Falta que confirme la otra parte.';
    if (p && p.confirmo_vecino && p.confirmo_emprendedor) {
      await cliente.query(`UPDATE publicaciones SET estado = 'finalizada' WHERE id = $1`, [p.id]);
      await cliente.query('UPDATE vecinos SET puntos = puntos + 5 WHERE id = $1', [p.vecino_id]);
      msg = '¡Transacción finalizada! El vecino ganó 5 puntos 🎉';
    }
    await cliente.query('COMMIT');
    res.redirect('/?msg=' + encodeURIComponent(msg));
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
});

// ---------- Página 2: canje de puntos ----------

app.get('/canje', async (req, res) => {
  const vecinos = await pool.query('SELECT * FROM vecinos ORDER BY nombre');
  const productos = await pool.query('SELECT * FROM productos WHERE disponible ORDER BY comercio');

  const tablaVecinos = vecinos.rows
    .map((v) => `<div class="tarjeta">${esc(v.nombre)} — <span class="puntos">${v.puntos} puntos</span></div>`)
    .join('');

  const opcionesVecinos = vecinos.rows
    .map((v) => `<option value="${v.id}">${esc(v.nombre)} (${v.puntos} pts)</option>`)
    .join('');
  const opcionesProductos = productos.rows
    .map((p) => `<option value="${p.id}">${esc(p.nombre)} — ${esc(p.comercio)} (${p.costo_puntos} pts)</option>`)
    .join('');

  const formulario = productos.rows.length
    ? `<div class="tarjeta">
        <h3>Canjear puntos</h3>
        <form method="POST" action="/canjear">
          <select name="vecino_id" required>${opcionesVecinos}</select>
          <select name="producto_id" required>${opcionesProductos}</select>
          <button>Canjear</button>
        </form>
        <p><small>Al canjear, el producto deja de estar disponible y se descuentan los puntos.</small></p>
      </div>`
    : '<p>No hay productos disponibles para canjear en este momento.</p>';

  res.send(pagina('Canje de puntos', '<h3>Puntos de los vecinos</h3>' + tablaVecinos + formulario, req.query.msg));
});

app.post('/canjear', async (req, res) => {
  const cliente = await pool.connect();
  try {
    // Transacción: descontar puntos y dar de baja el producto pasa junto, o no pasa nada
    await cliente.query('BEGIN');
    const vecino = (await cliente.query('SELECT * FROM vecinos WHERE id = $1', [req.body.vecino_id])).rows[0];
    const producto = (
      await cliente.query('SELECT * FROM productos WHERE id = $1 AND disponible', [req.body.producto_id])
    ).rows[0];

    let msg;
    if (!producto) {
      msg = 'Ese producto ya no está disponible.';
      await cliente.query('ROLLBACK');
    } else if (vecino.puntos < producto.costo_puntos) {
      msg = `${vecino.nombre} no tiene puntos suficientes (tiene ${vecino.puntos}, necesita ${producto.costo_puntos}).`;
      await cliente.query('ROLLBACK');
    } else {
      await cliente.query('UPDATE vecinos SET puntos = puntos - $1 WHERE id = $2', [producto.costo_puntos, vecino.id]);
      await cliente.query('UPDATE productos SET disponible = FALSE WHERE id = $1', [producto.id]);
      await cliente.query('COMMIT');
      msg = `¡Canje realizado! ${vecino.nombre} canjeó ${producto.costo_puntos} puntos por "${producto.nombre}".`;
    }
    res.redirect('/canje?msg=' + encodeURIComponent(msg));
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
});

app.listen(3000, () => {
  console.log('EcoCanje corriendo en http://localhost:3000');
});
