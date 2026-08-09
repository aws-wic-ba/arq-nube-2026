const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "peluapp",
  password: process.env.DB_PASSWORD || "peluapp_local",
  database: process.env.DB_NAME || "peluapp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

async function ensureSeedData() {
  await pool.query(`
    INSERT INTO professionals (name, specialty)
    SELECT ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM professionals WHERE name = ?
    )
  `, ["Sofía", "Coloración", "Sofía"]);

  await pool.query(`
    INSERT INTO professionals (name, specialty)
    SELECT ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM professionals WHERE name = ?
    )
  `, ["Martín", "Cortes", "Martín"]);

  await pool.query(`
    INSERT INTO professionals (name, specialty)
    SELECT ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM professionals WHERE name = ?
    )
  `, ["Valentina", "Peinados", "Valentina"]);

  await pool.query(`
    INSERT INTO services (name, duration_minutes, price)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM services WHERE name = ?
    )
  `, ["Corte", 60, 8500, "Corte"]);

  await pool.query(`
    INSERT INTO services (name, duration_minutes, price)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM services WHERE name = ?
    )
  `, ["Corte + brushing", 60, 11000, "Corte + brushing"]);

  await pool.query(`
    INSERT INTO services (name, duration_minutes, price)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM services WHERE name = ?
    )
  `, ["Coloración", 120, 22000, "Coloración"]);

  await pool.query(`
    INSERT INTO services (name, duration_minutes, price)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM services WHERE name = ?
    )
  `, ["Peinado", 60, 12000, "Peinado"]);
}

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.token;
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    if (payload.role !== "admin") throw new Error("Rol inválido");
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Sesión inválida o vencida" });
  }
}

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "ok" });
  } catch (error) {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.get("/api/services", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, duration_minutes, price FROM services WHERE active = TRUE ORDER BY name"
  );
  res.json(rows);
});

app.get("/api/professionals", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, specialty FROM professionals WHERE active = TRUE ORDER BY name"
  );
  res.json(rows);
});

app.get("/api/availability", async (req, res) => {
  const { date, professionalId } = req.query;
  if (!date || !professionalId) {
    return res.status(400).json({ error: "Faltan fecha y profesional" });
  }

  const [rows] = await pool.query(
    `SELECT TIME_FORMAT(appointment_time, '%H:%i') AS time
     FROM appointments
     WHERE professional_id = ?
       AND appointment_date = ?
       AND status = 'reservado'`,
    [professionalId, date]
  );

  const occupied = new Set(rows.map((r) => r.time));
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    const time = `${String(hour).padStart(2, "0")}:00`;
    slots.push({ time, available: !occupied.has(time) });
  }

  res.json(slots);
});

app.post("/api/appointments", async (req, res) => {
  const { clientName, email, phone, professionalId, serviceId, date, time } = req.body;

  if (!clientName || !email || !professionalId || !serviceId || !date || !time) {
    return res.status(400).json({ error: "Completá todos los campos obligatorios" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingClient] = await connection.query(
      "SELECT id FROM clients WHERE email = ? LIMIT 1",
      [email]
    );

    let clientId;
    if (existingClient.length) {
      clientId = existingClient[0].id;
      await connection.query(
        "UPDATE clients SET name = ?, phone = ? WHERE id = ?",
        [clientName, phone || null, clientId]
      );
    } else {
      const [insertClient] = await connection.query(
        "INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)",
        [clientName, email, phone || null]
      );
      clientId = insertClient.insertId;
    }

    const [serviceRows] = await connection.query(
      "SELECT duration_minutes FROM services WHERE id = ? AND active = TRUE",
      [serviceId]
    );
    if (!serviceRows.length) throw new Error("Servicio inexistente");

    const [occupied] = await connection.query(
      `SELECT id FROM appointments
       WHERE professional_id = ?
         AND appointment_date = ?
         AND appointment_time = ?
         AND status = 'reservado'
       FOR UPDATE`,
      [professionalId, date, time]
    );

    if (occupied.length) {
      await connection.rollback();
      return res.status(409).json({ error: "Ese horario acaba de ser reservado" });
    }

    const [insertAppointment] = await connection.query(
      `INSERT INTO appointments
       (client_id, professional_id, service_id, appointment_date, appointment_time)
       VALUES (?, ?, ?, ?, ?)`,
      [clientId, professionalId, serviceId, date, time]
    );

    await connection.commit();

    res.status(201).json({
      message: "Turno reservado correctamente",
      appointmentId: insertAppointment.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "No se pudo reservar el turno" });
  } finally {
    connection.release();
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === (process.env.ADMIN_USER || "admin") &&
    password === (process.env.ADMIN_PASSWORD || "peluapp2026")
  ) {
    const token = jwt.sign(
      { role: "admin", username },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "4h" }
    );
    return res.json({ token, role: "admin" });
  }
  res.status(401).json({ error: "Usuario o contraseña incorrectos" });
});

app.get("/api/admin/appointments", requireAdmin, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.id, a.appointment_date AS date,
            TIME_FORMAT(a.appointment_time, '%H:%i') AS time,
            a.status,
            c.name AS client_name, c.email, c.phone,
            p.name AS professional_name,
            s.name AS service_name
     FROM appointments a
     JOIN clients c ON c.id = a.client_id
     JOIN professionals p ON p.id = a.professional_id
     JOIN services s ON s.id = a.service_id
     ORDER BY a.appointment_date DESC, a.appointment_time DESC`
  );
  res.json(rows);
});

app.patch("/api/admin/appointments/:id/cancel", requireAdmin, async (req, res) => {
  const [result] = await pool.query(
    "UPDATE appointments SET status = 'cancelado' WHERE id = ? AND status = 'reservado'",
    [req.params.id]
  );
  if (!result.affectedRows) {
    return res.status(404).json({ error: "Turno no encontrado o ya cancelado" });
  }
  res.json({ message: "Turno cancelado" });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function startServer() {
  try {
    await pool.query("SELECT 1");
    await ensureSeedData();
    console.log("Datos iniciales de servicios y profesionales listos.");
    app.listen(PORT, () => {
      console.log(`PeluApp escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo inicializar PeluApp:", error);
    process.exit(1);
  }
}

startServer();
