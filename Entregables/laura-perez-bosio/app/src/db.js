const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Limite de conexiones simultaneas a la base, para no saturarla.
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  // No dejar conexiones ociosas tomadas para siempre.
  idleTimeoutMillis: 30000,
  // Si la base no responde en 5 s, fallar rapido en vez de acumular pedidos.
  connectionTimeoutMillis: 5000,
});

// Reintentos al arrancar: el contenedor de la app puede estar listo antes que Postgres.
async function esperarConexion(intentos = 10) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Conectado a PostgreSQL');
      return;
    } catch (err) {
      console.log(`Postgres no responde todavia (intento ${i}/${intentos})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('No se pudo conectar a PostgreSQL');
}

module.exports = { pool, esperarConexion };
