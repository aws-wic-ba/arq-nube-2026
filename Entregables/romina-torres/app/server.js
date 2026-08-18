const express = require("express");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "roversec",
  password: process.env.DB_PASSWORD || "roversec",
  database: process.env.DB_NAME || "roversec",
});

// Catalogo inicial de cursos de ciberseguridad
const SEED = [
  ["Introduccion al Hacking Etico", "inicial", 18900, "Fundamentos de pentesting y mentalidad ofensiva para principiantes.", "\u{1F9E0}", "15 h"],
  ["Fundamentos de Seguridad en la Nube", "inicial", 21500, "Protege infraestructuras en AWS aplicando el Well-Architected Framework.", "\u{2601}", "12 h"],
  ["Analisis de Malware", "avanzado", 32900, "Ingenieria inversa y analisis dinamico de software malicioso.", "\u{1F9A0}", "20 h"],
  ["Seguridad en Redes", "intermedio", 24900, "Firewalls, VPN, segmentacion y deteccion de intrusiones.", "\u{1F310}", "18 h"],
  ["Respuesta a Incidentes (DFIR)", "intermedio", 27500, "Deteccion, contencion y analisis forense de incidentes de seguridad.", "\u{1F6A8}", "16 h"],
  ["Criptografia Aplicada", "intermedio", 22900, "Cifrado, hashing, PKI y su uso correcto en aplicaciones reales.", "\u{1F510}", "14 h"],
  ["Seguridad Web y OWASP Top 10", "intermedio", 25900, "Explota y mitiga las vulnerabilidades web mas frecuentes.", "\u{1F577}", "17 h"],
  ["Zero Trust y Gestion de Identidad", "avanzado", 29900, "Disena arquitecturas Zero Trust con MFA y minimo privilegio.", "\u{1F6E1}", "13 h"],
];

async function initDb(retries = 15) {
  for (let intento = 1; intento <= retries; intento++) {
    try {
      const schema = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");
      await pool.query(schema);
      const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM cursos");
      if (rows[0].n === 0) {
        for (const c of SEED) {
          await pool.query(
            `INSERT INTO cursos (titulo, nivel, precio, descripcion, emoji, duracion)
             VALUES ($1,$2,$3,$4,$5,$6)`, c);
        }
        console.log(`Catalogo cargado: ${SEED.length} cursos.`);
      }
      console.log("Base de datos lista.");
      return;
    } catch (err) {
      console.log(`Esperando a la base de datos... (intento ${intento}/${retries})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("No se pudo conectar a la base de datos.");
}

app.get("/api/cursos", async (req, res) => {
  try {
    const { nivel } = req.query;
    let result;
    if (nivel && ["inicial", "intermedio", "avanzado"].includes(nivel)) {
      result = await pool.query("SELECT * FROM cursos WHERE nivel = $1 ORDER BY id", [nivel]);
    } else {
      result = await pool.query("SELECT * FROM cursos ORDER BY id");
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "No se pudo cargar el catalogo." });
  }
});

app.post("/api/compras", async (req, res) => {
  const { cliente_nombre, cliente_email, items } = req.body;
  if (!cliente_nombre || !cliente_email || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Faltan datos de la compra." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let total = 0;
    const detalle = [];
    for (const it of items) {
      const { rows } = await client.query("SELECT precio FROM cursos WHERE id = $1", [it.id]);
      if (rows.length === 0) throw new Error("Curso inexistente");
      const precio = rows[0].precio;
      total += precio;
      detalle.push({ id: it.id, precio });
    }
    const compra = await client.query(
      "INSERT INTO compras (cliente_nombre, cliente_email, total) VALUES ($1,$2,$3) RETURNING id",
      [cliente_nombre, cliente_email, total]);
    const compraId = compra.rows[0].id;
    for (const d of detalle) {
      await client.query(
        "INSERT INTO compra_items (compra_id, curso_id, precio_unitario) VALUES ($1,$2,$3)",
        [compraId, d.id, d.precio]);
    }
    await client.query("COMMIT");
    res.status(201).json({ compra_id: compraId, total });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "No se pudo registrar la compra." });
  } finally {
    client.release();
  }
});

app.get("/api/health", async (req, res) => {
  try { await pool.query("SELECT 1"); res.json({ status: "ok" }); }
  catch { res.status(503).json({ status: "sin base de datos" }); }
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`Roversec escuchando en http://localhost:${PORT}`));
}).catch((err) => { console.error(err.message); process.exit(1); });
