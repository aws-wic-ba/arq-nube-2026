const cron = require("node-cron");
const pool = require("./db");
const { enviarRecordatorio } = require("./mailer");

/**
 * Busca todos los controles cuya fecha de "próximo control" es HOY y que
 * todavía no fueron notificados, envía el email correspondiente, y marca
 * notificado_en para no volver a enviarlo.
 *
 * Ejemplo: si un control se marcó como hecho el 18-04-2026 con una
 * frecuencia de 6 meses, proximo_control queda en 18-10-2026. Este job,
 * al correr el 18-10-2026, lo encuentra y dispara el email ese mismo día.
 */
async function revisarYNotificarVencimientos() {
  console.log(`[recordatorios] Revisando vencimientos de hoy (${new Date().toISOString().split("T")[0]})...`);

  try {
    const pendientes = await pool.query(
      `SELECT ch.id, ch.nombre, ch.fecha_realizado, u.email
       FROM controles_historial ch
       JOIN usuarios u ON u.id = ch.usuario_id
       WHERE ch.proximo_control = CURRENT_DATE
         AND ch.notificado_en IS NULL
         AND ch.no_aplica IS NOT TRUE`
    );

    for (const fila of pendientes.rows) {
      try {
        await enviarRecordatorio({
          email: fila.email,
          nombreControl: fila.nombre,
          fechaRealizado: fila.fecha_realizado,
        });
        await pool.query(
          `UPDATE controles_historial SET notificado_en = now() WHERE id = $1`,
          [fila.id]
        );
        console.log(`[recordatorios] Enviado a ${fila.email} (${fila.nombre})`);
      } catch (errorEnvio) {
        // Si falla el envío de UN email, no corta el resto de la ronda
        console.error(`[recordatorios] Error enviando a ${fila.email}:`, errorEnvio.message);
      }
    }

    console.log(`[recordatorios] Listo: ${pendientes.rows.length} recordatorio(s) procesados.`);
  } catch (error) {
    console.error("[recordatorios] Error revisando vencimientos:", error);
  }
}

/**
 * Programa el job para correr todos los días a las 08:00 (hora del contenedor).
 */
function iniciarJobRecordatorios() {
  cron.schedule("0 8 * * *", revisarYNotificarVencimientos);
  console.log("[recordatorios] Job programado: todos los días a las 08:00");
}

module.exports = { iniciarJobRecordatorios, revisarYNotificarVencimientos };
