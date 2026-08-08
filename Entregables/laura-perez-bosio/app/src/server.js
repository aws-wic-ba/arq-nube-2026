const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const { pool, esperarConexion } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const COOKIE_CARRITO = 'carrito_token';
const DIAS_30 = 30 * 24 * 60 * 60 * 1000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-secret-cambiar-en-produccion'));

// El carrito NO vive en la memoria del proceso: vive en la base. El navegador
// solo guarda un token en una cookie firmada. Asi la aplicacion queda sin
// estado y cualquier instancia puede atender cualquier pedido.
async function cargarCarrito(req, res, next) {
  try {
    const token = req.signedCookies[COOKIE_CARRITO];
    req.carrito = null;
    res.locals.itemsEnCarrito = 0;

    if (token) {
      const { rows } = await pool.query('SELECT id FROM carritos WHERE token = $1', [token]);
      if (rows.length) {
        req.carrito = rows[0].id;
        const { rows: [t] } = await pool.query(
          'SELECT COALESCE(SUM(cantidad), 0)::int AS total FROM carrito_items WHERE carrito_id = $1',
          [req.carrito]
        );
        res.locals.itemsEnCarrito = t.total;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}
app.use(cargarCarrito);

// Crea el carrito recien cuando hace falta, para no generar una fila por cada
// visita que no compra nada.
async function obtenerOCrearCarrito(req, res) {
  if (req.carrito) return req.carrito;
  const token = crypto.randomUUID();
  const { rows: [c] } = await pool.query(
    'INSERT INTO carritos (token) VALUES ($1) RETURNING id',
    [token]
  );
  res.cookie(COOKIE_CARRITO, token, { httpOnly: true, signed: true, maxAge: DIAS_30, sameSite: 'lax' });
  req.carrito = c.id;
  return c.id;
}

const formatearPrecio = (n) =>
  '$ ' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Health check: lo usa el healthcheck de docker-compose y, en AWS, el balanceador.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'sin base de datos' });
  }
});

// --- Pagina 1: catalogo ---
app.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
    res.render('catalogo', { productos: rows, formatearPrecio, agregado: req.query.agregado });
  } catch (err) {
    next(err);
  }
});

app.post('/carrito/agregar', async (req, res, next) => {
  try {
    const id = parseInt(req.body.producto_id, 10);
    if (!Number.isInteger(id)) return res.redirect('/');

    const carritoId = await obtenerOCrearCarrito(req, res);
    await pool.query(
      `INSERT INTO carrito_items (carrito_id, producto_id, cantidad) VALUES ($1, $2, 1)
       ON CONFLICT (carrito_id, producto_id) DO UPDATE SET cantidad = carrito_items.cantidad + 1`,
      [carritoId, id]
    );
    await pool.query('UPDATE carritos SET actualizado_en = NOW() WHERE id = $1', [carritoId]);
    // Si vino desde una recomendacion dentro del carrito, vuelve al carrito.
    res.redirect(req.body.volver === 'carrito' ? '/carrito' : '/?agregado=1');
  } catch (err) {
    next(err);
  }
});

// "Quien compro esto tambien compro": busca los pedidos historicos que
// contienen alguno de los productos del carrito y cuenta que otros productos
// aparecian en esos mismos pedidos. No hace falta ningun servicio extra, sale
// de los datos que ya tengo.
async function recomendar(idsEnCarrito, limite = 3) {
  if (!idsEnCarrito.length) return [];
  const { rows } = await pool.query(
    `SELECT p.*, COUNT(*)::int AS veces
       FROM pedido_items origen
       JOIN pedido_items acompanante
         ON acompanante.pedido_id = origen.pedido_id
        AND acompanante.producto_id <> origen.producto_id
       JOIN productos p ON p.id = acompanante.producto_id
      WHERE origen.producto_id = ANY($1)
        AND acompanante.producto_id <> ALL($1)
        AND p.stock > 0
      GROUP BY p.id
      ORDER BY veces DESC, p.id
      LIMIT $2`,
    [idsEnCarrito, limite]
  );
  return rows;
}

// --- Pagina 2: carrito ---
app.get('/carrito', async (req, res, next) => {
  try {
    let items = [];
    if (req.carrito) {
      const { rows } = await pool.query(
        `SELECT p.*, ci.cantidad
           FROM carrito_items ci
           JOIN productos p ON p.id = ci.producto_id
          WHERE ci.carrito_id = $1
          ORDER BY p.id`,
        [req.carrito]
      );
      items = rows.map((p) => ({ ...p, subtotal: Number(p.precio) * p.cantidad }));
    }
    const total = items.reduce((acc, i) => acc + i.subtotal, 0);
    const recomendados = await recomendar(items.map((i) => i.id));
    res.render('carrito', {
      items,
      total,
      recomendados,
      formatearPrecio,
      pedido: req.query.pedido,
      error: req.query.error,
    });
  } catch (err) {
    next(err);
  }
});

app.post('/carrito/eliminar', async (req, res, next) => {
  try {
    if (req.carrito) {
      await pool.query('DELETE FROM carrito_items WHERE carrito_id = $1 AND producto_id = $2', [
        req.carrito,
        parseInt(req.body.producto_id, 10),
      ]);
    }
    res.redirect('/carrito');
  } catch (err) {
    next(err);
  }
});

app.post('/carrito/vaciar', async (req, res, next) => {
  try {
    if (req.carrito) await pool.query('DELETE FROM carrito_items WHERE carrito_id = $1', [req.carrito]);
    res.redirect('/carrito');
  } catch (err) {
    next(err);
  }
});

// Confirmar el pedido descuenta stock y crea el pedido dentro de una
// transaccion: o se registra todo, o no se registra nada.
app.post('/carrito/confirmar', async (req, res, next) => {
  if (!req.carrito) return res.redirect('/carrito');

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const { rows: items } = await cliente.query(
      'SELECT producto_id, cantidad FROM carrito_items WHERE carrito_id = $1',
      [req.carrito]
    );
    if (items.length === 0) {
      await cliente.query('ROLLBACK');
      return res.redirect('/carrito');
    }

    const cantidadPorProducto = Object.fromEntries(items.map((i) => [i.producto_id, i.cantidad]));
    const ids = items.map((i) => i.producto_id);

    // FOR UPDATE bloquea las filas para que dos compras simultaneas no vendan
    // el mismo stock.
    const { rows: productos } = await cliente.query(
      'SELECT * FROM productos WHERE id = ANY($1) ORDER BY id FOR UPDATE',
      [ids]
    );

    const sinStock = productos.find((p) => p.stock < cantidadPorProducto[p.id]);
    if (sinStock) {
      await cliente.query('ROLLBACK');
      return res.redirect('/carrito?error=' + encodeURIComponent(`Sin stock suficiente de ${sinStock.nombre}`));
    }

    const total = productos.reduce((acc, p) => acc + Number(p.precio) * cantidadPorProducto[p.id], 0);

    const { rows: [pedido] } = await cliente.query(
      'INSERT INTO pedidos (total) VALUES ($1) RETURNING id',
      [total]
    );

    for (const p of productos) {
      await cliente.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
        [pedido.id, p.id, cantidadPorProducto[p.id], p.precio]
      );
      await cliente.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [
        cantidadPorProducto[p.id],
        p.id,
      ]);
    }

    // Vaciar el carrito forma parte de la misma transaccion.
    await cliente.query('DELETE FROM carrito_items WHERE carrito_id = $1', [req.carrito]);

    await cliente.query('COMMIT');
    res.redirect('/carrito?pedido=' + pedido.id);
  } catch (err) {
    await cliente.query('ROLLBACK');
    next(err);
  } finally {
    cliente.release();
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Error interno del servidor');
});

esperarConexion()
  .then(() => app.listen(PORT, () => console.log(`ShibaShop escuchando en http://localhost:${PORT}`)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
