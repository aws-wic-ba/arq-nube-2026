const express = require("express");
const pool = require("./db");

const app = express();

const PORT = 4000;

app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.send("🚀 Bienvenido a la API de SalonBook");
});

// Obtener servicios
app.get("/services", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM services ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener servicios:", error);

    res.status(500).json({
      error: "Error al obtener los servicios",
    });
  }
});

// Crear una reserva
app.post("/bookings", async (req, res) => {
  try {
    const {
      name,
      email,
      service_id,
      appointment_date,
    } = req.body;

    if (!name || !email || !service_id || !appointment_date) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    // Crear usuario si no existe
    const userResult = await pool.query(
      `
      INSERT INTO users (name, email)
      VALUES ($1, $2)
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id
      `,
      [name, email]
    );

    const userId = userResult.rows[0].id;

    // Crear reserva
    const bookingResult = await pool.query(
      `
      INSERT INTO bookings
      (user_id, service_id, appointment_date)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [userId, service_id, appointment_date]
    );

    res.status(201).json({
      message: "Reserva creada correctamente",
      booking: bookingResult.rows[0],
    });

  } catch (error) {
    console.error("Error al crear la reserva:", error);

    res.status(500).json({
      error: "Error al crear la reserva",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});