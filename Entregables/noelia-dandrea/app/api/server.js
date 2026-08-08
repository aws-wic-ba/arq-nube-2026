// API de Cocina & Objetivo
// Expone el catálogo (recetas, ingredientes, ejercicios) y el cálculo nutricional.
// En AWS este mismo contenedor corre en ECS Fargate detrás de un ALB.

import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Health check: lo usa el healthcheck de Docker y, en AWS, el target group del ALB
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "db_unavailable" });
  }
});

app.get("/ingredientes", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT id, nombre FROM ingredientes ORDER BY nombre");
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// Búsqueda de recetas por ingredientes disponibles.
// Esta consulta es la razón por la que el catálogo va en una base relacional:
// la relación receta<->ingrediente es N:N y el ranking sale de un GROUP BY.
app.post("/recetas/buscar", async (req, res, next) => {
  const disponibles = Array.isArray(req.body?.ingredientes) ? req.body.ingredientes : [];
  const objetivo = ["bajar", "mantener", "musculo"].includes(req.body?.objetivo)
    ? req.body.objetivo
    : "mantener";

  if (disponibles.length === 0) return res.json([]);

  try {
    const { rows } = await pool.query(
      `SELECT r.id,
              r.nombre,
              r.minutos,
              r.kcal,
              r.proteina,
              r.pasos,
              r.tip,
              r.objetivos,
              COUNT(*) FILTER (WHERE i.nombre = ANY($1)) AS tiene,
              COUNT(*)                                   AS total,
              ROUND(100.0 * COUNT(*) FILTER (WHERE i.nombre = ANY($1)) / COUNT(*)) AS match
         FROM recetas r
         JOIN receta_ingrediente ri ON ri.receta_id = r.id
         JOIN ingredientes i        ON i.id = ri.ingrediente_id
        GROUP BY r.id
       HAVING COUNT(*) FILTER (WHERE i.nombre = ANY($1)) > 0
        ORDER BY ($2 = ANY(r.objetivos)) DESC, match DESC, r.minutos ASC
        LIMIT 20`,
      [disponibles, objetivo],
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.get("/ejercicios", async (req, res, next) => {
  const objetivo = ["bajar", "mantener", "musculo"].includes(req.query.objetivo)
    ? req.query.objetivo
    : "mantener";
  const edad = Number(req.query.edad) || 30;
  try {
    const { rows } = await pool.query(
      `SELECT nombre, zona, series, como
         FROM ejercicios
        WHERE objetivo = $1
          AND ($2 < 45 OR bajo_impacto = true)
        ORDER BY zona, nombre`,
      [objetivo, edad],
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// Cálculo nutricional (Mifflin-St Jeor). Es CPU-bound y sin estado:
// por eso escala horizontal tan bien con Auto Scaling por CPU.
app.post("/calculo", (req, res) => {
  const { sexo = "f", edad = 30, peso = 70, altura = 165, actividad = "ligera", objetivo = "mantener" } =
    req.body ?? {};

  const factores = { sedentaria: 1.2, ligera: 1.375, moderada: 1.55, alta: 1.725 };
  const tmb = 10 * peso + 6.25 * altura - 5 * edad + (sexo === "m" ? 5 : -161);
  const mantenimiento = tmb * (factores[actividad] ?? 1.375);
  const ajuste = objetivo === "bajar" ? 0.8 : objetivo === "musculo" ? 1.12 : 1;
  const calorias = mantenimiento * ajuste;
  const proteinas = peso * (objetivo === "musculo" ? 1.9 : objetivo === "bajar" ? 1.7 : 1.4);
  const grasas = (calorias * 0.27) / 9;
  const carbos = Math.max(0, (calorias - proteinas * 4 - grasas * 9) / 4);

  res.json({
    tmb: Math.round(tmb),
    mantenimiento: Math.round(mantenimiento),
    calorias: Math.round(calorias),
    proteinas: Math.round(proteinas),
    carbos: Math.round(carbos),
    grasas: Math.round(grasas),
    imc: Math.round((peso / (altura / 100) ** 2) * 10) / 10,
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno" });
});

const port = process.env.API_PORT || 3001;
app.listen(port, () => console.log(`API escuchando en :${port}`));
