const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.APP_PORT || 3000;

function buildDbConfig() {
  const envHost = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      const parsedUrl = new URL(dbUrl);
      return {
        host: parsedUrl.hostname || envHost || 'db',
        user: decodeURIComponent(parsedUrl.username || user || ''),
        password: decodeURIComponent(parsedUrl.password || password || ''),
        database: database || parsedUrl.pathname.replace(/^\//, ''),
      };
    } catch (error) {
      console.warn('No se pudo parsear DATABASE_URL, usando fallback:', error.message);
    }
  }

  return {
    host: envHost || 'db',
    user,
    password,
    database,
  };
}

const dbConfig = buildDbConfig();

app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MesaFacil | App de reservas</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --ink: #1f2937;
        --soft-ink: #4b5563;
        --accent: #0ea5a4;
        --accent-2: #f97316;
        --paper: #f8fafc;
        --card: rgba(255, 255, 255, 0.86);
        --border: rgba(31, 41, 55, 0.14);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Space Grotesk", "Segoe UI", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at 10% 20%, rgba(14, 165, 164, 0.28), transparent 42%),
          radial-gradient(circle at 90% 10%, rgba(249, 115, 22, 0.25), transparent 40%),
          linear-gradient(145deg, #fffaf0 0%, var(--paper) 45%, #edf2ff 100%);
      }

      .wrap {
        max-width: 1080px;
        margin: 0 auto;
        padding: 32px 20px 56px;
      }

      .hero {
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--card);
        backdrop-filter: blur(6px);
        padding: 34px;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        animation: fadeUp 560ms ease-out;
      }

      .brand {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 22px;
        padding-bottom: 16px;
        border-bottom: 1px dashed var(--border);
      }

      .brand-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .brand-badge {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        font-size: 0.9rem;
        font-weight: 700;
        color: #062f2f;
        background: linear-gradient(120deg, #22d3ee, #0ea5a4);
      }

      .brand-title {
        margin: 0;
        font-size: 1.03rem;
        font-weight: 700;
      }

      .brand-sub {
        margin: 2px 0 0;
        font-size: 0.86rem;
        color: var(--soft-ink);
      }

      .meta {
        text-align: right;
        font-size: 0.85rem;
        color: var(--soft-ink);
        line-height: 1.45;
      }

      .kicker {
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--accent);
        font-weight: 700;
      }

      h1 {
        font-size: clamp(2rem, 3.8vw, 3.4rem);
        line-height: 1.08;
        margin: 12px 0 12px;
      }

      .lead {
        max-width: 70ch;
        color: var(--soft-ink);
        font-size: 1.05rem;
        margin-bottom: 24px;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: #ecfeff;
        color: #155e75;
        border: 1px solid #a5f3fc;
        border-radius: 999px;
        padding: 8px 14px;
        font-weight: 600;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.15);
      }

      .grid {
        margin-top: 24px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .card {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
      }

      .card h3 {
        margin: 0 0 10px;
        font-size: 1rem;
      }

      .card p {
        margin: 0 0 14px;
        font-size: 0.95rem;
        color: var(--soft-ink);
      }

      .row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .btn {
        text-decoration: none;
        display: inline-block;
        border-radius: 11px;
        padding: 9px 12px;
        font-weight: 700;
        font-size: 0.9rem;
        transition: transform 130ms ease, box-shadow 130ms ease;
      }

      .btn.primary {
        background: linear-gradient(95deg, var(--accent), #22d3ee);
        color: #083344;
      }

      .btn.alt {
        background: linear-gradient(95deg, #fdba74, var(--accent-2));
        color: #7c2d12;
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 18px rgba(2, 132, 199, 0.18);
      }

      .footer {
        margin-top: 14px;
        font-size: 0.9rem;
        color: var(--soft-ink);
      }

      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 900px) {
        .brand {
          flex-direction: column;
          align-items: flex-start;
        }

        .meta {
          text-align: left;
        }

        .grid {
          grid-template-columns: 1fr;
        }

        .hero {
          padding: 24px;
        }
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="hero">
        <div class="brand">
          <div class="brand-left">
            <div class="brand-badge">MF</div>
            <div>
              <p class="brand-title">MesaFacil</p>
              <p class="brand-sub">Trabajo practico final - Arquitectura de Nube 2026</p>
            </div>
          </div>
          <div class="meta">
            <div>Autora: Sandra Olier</div>
            <div>Fecha: Agosto 2026</div>
          </div>
        </div>

        <div class="kicker">Arquitectura en la nube 2026</div>
        <h1>MesaFacil esta activo y listo para operar</h1>
        <p class="lead">
          Servicio de reservas desplegado con Node.js, MySQL y Nginx mediante Docker Compose.
          Esta portada valida estado operativo y te deja atajos para pruebas funcionales.
        </p>

        <div class="status">
          <span class="dot"></span>
          Sistema en linea
        </div>

        <div class="grid">
          <article class="card">
            <h3>Healthcheck</h3>
            <p>Verifica disponibilidad del proceso de aplicacion.</p>
            <div class="row">
              <a class="btn primary" href="/health" target="_blank" rel="noopener noreferrer">Abrir /health</a>
            </div>
          </article>

          <article class="card">
            <h3>Base de datos</h3>
            <p>Consulta de prueba para confirmar conectividad con MySQL.</p>
            <div class="row">
              <a class="btn alt" href="/test-db" target="_blank" rel="noopener noreferrer">Abrir /test-db</a>
            </div>
          </article>

          <article class="card">
            <h3>Reservas</h3>
            <p>Listado actual de reservas para validaciones de endpoint.</p>
            <div class="row">
              <a class="btn primary" href="/reservas" target="_blank" rel="noopener noreferrer">Abrir /reservas</a>
            </div>
          </article>
        </div>

        <p class="footer">MesaFacil | Node.js + MySQL + Nginx | Entorno local de practica</p>
      </section>
    </main>
  </body>
</html>`);
});

// Probar conexión a la base
app.get('/test-db', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query('SELECT NOW() AS fecha');
    await connection.end();
    res.json({ status: 'ok', dbTime: rows[0].fecha });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Healthcheck para Docker y balanceadores
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Listar reservas
app.get('/reservas', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query('SELECT * FROM reservas');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Crear nueva reserva (POST)
app.post('/reservas', async (req, res) => {
  const { cliente_nombre, cliente_email, fecha, hora, personas } = req.body;
  if (!cliente_nombre || !cliente_email || !fecha || !hora || !personas) {
    return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.query(
      'INSERT INTO reservas (cliente_nombre, cliente_email, fecha, hora, personas) VALUES (?, ?, ?, ?, ?)',
      [cliente_nombre, cliente_email, fecha, hora, personas]
    );
    await connection.end();
    res.json({ status: 'ok', id: result.insertId });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
