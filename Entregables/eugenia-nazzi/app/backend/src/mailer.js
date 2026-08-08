const nodemailer = require("nodemailer");

// El transporte SMTP es genérico: en local apunta a Mailhog (sin auth),
// y en producción basta con cambiar las variables de entorno para apuntar
// al servicio de envío de emails que se use en ese ambiente.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
});

/**
 * Envía el email de recordatorio de un control/vacuna que vence hoy.
 */
async function enviarRecordatorio({ email, nombreControl, fechaRealizado }) {
  const asunto = `Recordatorio: te toca "${nombreControl}"`;
  const cuerpo = `
    <p>Hola,</p>
    <p>Según tu planilla de controles médicos, hoy es la fecha estimada para repetir:</p>
    <p><strong>${nombreControl}</strong></p>
    <p>(Tu último registro fue el ${fechaRealizado}.)</p>
    <p>Ingresá a la app para actualizar tu historial una vez que lo realices.</p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: asunto,
    html: cuerpo,
  });
}

module.exports = { enviarRecordatorio };
