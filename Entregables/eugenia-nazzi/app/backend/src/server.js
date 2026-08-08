const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { generarPlanilla } = require("./reglas");
const { iniciarJobRecordatorios, revisarYNotificarVencimientos } = require("./recordatorios");

const app = express();
const PORT = process.env.PORT || 4000;

// Habilita CORS para que el frontend (otro origen: localhost:3000)
// pueda hacer requests a esta API (localhost:4000)
app.use(cors());
app.use(express.json());

/**
 * Endpoint de health check.
 * Lo usa el healthcheck de Docker (docker-compose.yml) para saber si el
 * backend está realmente operativo, no solo "levantado".
 *
 * Devuelve:
 *  - 200 { status: "ok" }      si el backend puede consultar la base
 *  - 503 { status: "error" }   si la base no responde
 */
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "API de Controles Médicos y Vacunas" });
});

/**
 * Busca si ya existe un usuario registrado con ese email, para no pedirle
 * de nuevo fecha de nacimiento y sexo (datos que no cambian). Si no existe,
 * devuelve 404 y el frontend pide los datos como alta nueva.
 */
app.get("/api/usuarios/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(
      `SELECT fecha_nacimiento, sexo FROM usuarios WHERE email = $1`,
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const fila = result.rows[0];
    res.json({
      fechaNacimiento: fila.fecha_nacimiento.toISOString().split("T")[0],
      sexo: fila.sexo,
    });
  } catch (error) {
    console.error("Error en GET /api/usuarios/:email:", error);
    res.status(500).json({ error: "Error al buscar el usuario" });
  }
});

/**
 * Genera (y persiste) la planilla personalizada de un usuario.
 *
 * Body esperado: { "email": "...", "fechaNacimiento": "1990-05-20", "sexo": "mujer" }
 *
 * 1. Hace upsert del usuario por email (si ya existe, actualiza fecha/sexo).
 * 2. Calcula el catálogo de ítems que le corresponde (reglas.js).
 * 3. Trae el historial ya guardado de ese usuario y lo combina con el catálogo,
 *    para que si vuelve a entrar, vea reflejado lo que ya había cargado.
 */
app.post("/api/planilla", async (req, res) => {
  const { email, fechaNacimiento, sexo } = req.body;

  if (!email || !fechaNacimiento || !sexo) {
    return res.status(400).json({ error: "Faltan datos: email, fechaNacimiento y sexo son obligatorios" });
  }
  if (!["mujer", "varon"].includes(sexo)) {
    return res.status(400).json({ error: "sexo debe ser 'mujer' o 'varon'" });
  }
  const fechaValida = !isNaN(new Date(fechaNacimiento).getTime());
  if (!fechaValida) {
    return res.status(400).json({ error: "fechaNacimiento inválida" });
  }

  try {
    // Upsert de usuario por email
    const usuarioResult = await pool.query(
      `INSERT INTO usuarios (email, fecha_nacimiento, sexo)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET fecha_nacimiento = EXCLUDED.fecha_nacimiento, sexo = EXCLUDED.sexo
       RETURNING id`,
      [email, fechaNacimiento, sexo]
    );
    const usuarioId = usuarioResult.rows[0].id;

    // Catálogo que le corresponde según edad/sexo
    const { edad, items } = generarPlanilla(fechaNacimiento, sexo);

    // Historial ya guardado para este usuario (catálogo + ítems manuales)
    const historialResult = await pool.query(
      `SELECT item_id, nombre, categoria, completado, fecha_realizado, frecuencia_meses, no_aplica, proximo_control
       FROM controles_historial WHERE usuario_id = $1`,
      [usuarioId]
    );
    const historialPorItem = {};
    for (const fila of historialResult.rows) {
      historialPorItem[fila.item_id] = fila;
    }

    // Combina el catálogo con el estado guardado (si existe).
    // Si el usuario ya editó la frecuencia alguna vez, esa tiene prioridad
    // sobre la sugerida por el catálogo (frecuencia_meses guardada en la DB).
    const itemsConEstado = items.map((item) => {
      const guardado = historialPorItem[item.id];
      return {
        ...item,
        frecuenciaMeses: guardado?.frecuencia_meses !== undefined && guardado?.frecuencia_meses !== null
          ? guardado.frecuencia_meses
          : item.frecuenciaMeses,
        completado: guardado?.completado || false,
        fechaRealizado: guardado?.fecha_realizado || null,
        noAplica: guardado?.no_aplica || false,
        proximoControl: guardado?.proximo_control || null,
      };
    });

    // Ítems manuales ya guardados (no vienen del catálogo, se agregan aparte)
    const itemsManuales = historialResult.rows
      .filter((fila) => fila.categoria === "manual")
      .map((fila) => ({
        id: fila.item_id,
        categoria: "manual",
        nombre: fila.nombre,
        nota: "Control agregado manualmente",
        frecuenciaMeses: fila.frecuencia_meses,
        completado: fila.completado,
        fechaRealizado: fila.fecha_realizado,
        noAplica: fila.no_aplica,
        proximoControl: fila.proximo_control,
      }));

    res.json({ usuarioId, edad, items: itemsConEstado, manuales: itemsManuales });
  } catch (error) {
    console.error("Error en /api/planilla:", error);
    res.status(500).json({ error: "Error al generar la planilla" });
  }
});

/**
 * Guarda (upsert) el estado de un ítem del historial: si ya existe una fila
 * para ese usuario+item, la actualiza; si no, la crea.
 *
 * Body esperado:
 * {
 *   "usuarioId": 1,
 *   "itemId": "pap-vph",
 *   "nombre": "Papanicolau (PAP) y VPH",
 *   "categoria": "control",
 *   "completado": true,
 *   "fechaRealizado": "2026-03-10",
 *   "frecuenciaMeses": 36   // null si es esquema único o ítem manual
 * }
 */
app.put("/api/historial", async (req, res) => {
  const { usuarioId, itemId, nombre, categoria, completado, fechaRealizado, frecuenciaMeses, noAplica } = req.body;

  if (!usuarioId || !itemId || !nombre || !categoria) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  // Si el usuario indicó "no aplica", no tiene sentido calcular ni notificar
  // un próximo control para ese ítem.
  let proximoControl = null;
  if (!noAplica && fechaRealizado && frecuenciaMeses) {
    const fecha = new Date(fechaRealizado);
    fecha.setMonth(fecha.getMonth() + frecuenciaMeses);
    proximoControl = fecha.toISOString().split("T")[0];
  }

  try {
    const result = await pool.query(
      `INSERT INTO controles_historial
        (usuario_id, item_id, nombre, categoria, completado, fecha_realizado, frecuencia_meses, no_aplica, proximo_control, notificado_en, actualizado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, now())
       ON CONFLICT (usuario_id, item_id)
       DO UPDATE SET
         nombre = EXCLUDED.nombre,
         categoria = EXCLUDED.categoria,
         completado = EXCLUDED.completado,
         fecha_realizado = EXCLUDED.fecha_realizado,
         frecuencia_meses = EXCLUDED.frecuencia_meses,
         no_aplica = EXCLUDED.no_aplica,
         proximo_control = EXCLUDED.proximo_control,
         notificado_en = NULL,
         actualizado_en = now()
       RETURNING *`,
      [usuarioId, itemId, nombre, categoria, !!completado, fechaRealizado || null, frecuenciaMeses ?? null, !!noAplica, proximoControl]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error en /api/historial:", error);
    res.status(500).json({ error: "Error al guardar el control" });
  }
});

/**
 * Dispara manualmente la revisión de vencimientos, sin esperar al horario
 * programado (0 8 * * *). Pensado para probar el flujo en desarrollo:
 * cambiá la fecha del sistema o insertá una fila con proximo_control = hoy,
 * y llamá a este endpoint para ver el email llegar a Mailhog al instante.
 */
app.post("/api/recordatorios/ejecutar", async (req, res) => {
  await revisarYNotificarVencimientos();
  res.json({ ok: true, mensaje: "Revisión de recordatorios ejecutada" });
});

// Reintento de conexión inicial con backoff, para tolerar que la DB
// tarde en estar lista aunque el healthcheck de docker-compose falle una vez
async function waitForDatabase(retries = 10, delayMs = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("Conexión a la base de datos establecida");
      return;
    } catch (error) {
      console.log(`Intento ${i}/${retries}: base de datos no disponible aún, reintentando en ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  console.error("No se pudo conectar a la base de datos luego de varios intentos");
}

app.listen(PORT, async () => {
  console.log(`Backend escuchando en el puerto ${PORT}`);
  await waitForDatabase();
  iniciarJobRecordatorios();
});
