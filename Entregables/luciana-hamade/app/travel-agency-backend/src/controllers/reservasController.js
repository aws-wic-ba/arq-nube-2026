const db = require('../config/db');

// GET /api/reservas -> Obtener todas las reservas (con info del destino)
const obtenerReservas = async (req, res) => {
  try {
    const queryText = `
      SELECT 
        r.id,
        r.nombre_cliente AS "nombreCliente",
        r.email_cliente AS "emailCliente",
        r.fecha_viaje AS "fechaViaje",
        r.estado,
        r.creado_en AS "creadoEn",
        d.id AS "destinoId",
        d.nombre AS "destinoNombre",
        d.precio AS "destinoPrecio",
        d.moneda AS "destinoMoneda"
      FROM reservas r
      JOIN destinos d ON r.destino_id = d.id
      ORDER BY r.id DESC
    `;

    const result = await db.query(queryText);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar las reservas'
    });
  }
};

// POST /api/reservas -> Crear una nueva reserva en PostgreSQL
const crearReserva = async (req, res) => {
  const { nombreCliente, emailCliente, destinoId, fechaViaje } = req.body;

  // Validación simple de campos obligatorios
  if (!nombreCliente || !emailCliente || !destinoId || !fechaViaje) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios: nombreCliente, emailCliente, destinoId, fechaViaje'
    });
  }

  try {
    // 1. Verificar si el destino existe
    const destinoExiste = await db.query('SELECT id FROM destinos WHERE id = $1', [destinoId]);
    if (destinoExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `El destino con ID ${destinoId} no existe.`
      });
    }

    // 2. Insertar la reserva en la BD
    const insertQuery = `
      INSERT INTO reservas (nombre_cliente, email_cliente, destino_id, fecha_viaje)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id, 
        nombre_cliente AS "nombreCliente", 
        email_cliente AS "emailCliente", 
        destino_id AS "destinoId", 
        fecha_viaje AS "fechaViaje", 
        estado, 
        creado_en AS "creadoEn";
    `;

    const result = await db.query(insertQuery, [nombreCliente, emailCliente, destinoId, fechaViaje]);

    res.status(201).json({
      success: true,
      message: '¡Reserva creada y guardada en PostgreSQL con éxito!',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la reserva'
    });
  }
};

// PUT /api/reservas/:id -> Actualizar fecha o estado de la reserva
const actualizarReserva = async (req, res) => {
  const { id } = req.params;
  const { fechaViaje, estado } = req.body;

  if (!fechaViaje && !estado) {
    return res.status(400).json({
      success: false,
      message: 'Proporcione al menos un campo para actualizar (fechaViaje o estado).'
    });
  }

  try {
    const updateQuery = `
      UPDATE reservas 
      SET 
        fecha_viaje = COALESCE($1, fecha_viaje),
        estado = COALESCE($2, estado)
      WHERE id = $3
      RETURNING 
        id, 
        nombre_cliente AS "nombreCliente", 
        email_cliente AS "emailCliente", 
        destino_id AS "destinoId", 
        fecha_viaje AS "fechaViaje", 
        estado, 
        creado_en AS "creadoEn";
    `;

    const result = await db.query(updateQuery, [fechaViaje, estado, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ninguna reserva con el ID ${id}.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Reserva con ID ${id} actualizada con éxito.`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar la reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la reserva'
    });
  }
};

// DELETE /api/reservas/:id -> Eliminar una reserva
const eliminarReserva = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM reservas WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ninguna reserva con el ID ${id}.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Reserva con ID ${id} eliminada exitosamente.`
    });
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la reserva'
    });
  }
};

module.exports = {
  obtenerReservas,
  crearReserva,
  actualizarReserva,
  eliminarReserva
};

