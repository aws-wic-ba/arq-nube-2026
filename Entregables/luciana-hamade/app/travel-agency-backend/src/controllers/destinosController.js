const db = require('../config/db');

// 1. GET /api/destinos -> Obtener todos los destinos
const obtenerDestinos = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, descripcion, precio, moneda, imagen FROM destinos ORDER BY id ASC'
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener destinos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar los destinos'
    });
  }
};

// 2. POST /api/destinos -> Crear un nuevo destino
const crearDestino = async (req, res) => {
  const { nombre, descripcion, precio, moneda, imagen } = req.body;

  if (!nombre || !precio || !imagen) {
    return res.status(400).json({
      success: false,
      message: 'Los campos nombre, precio e imagen son obligatorios.'
    });
  }

  try {
    const insertQuery = `
      INSERT INTO destinos (nombre, descripcion, precio, moneda, imagen)
      VALUES ($1, $2, $3, COALESCE($4, 'ARS'), $5)
      RETURNING id, nombre, descripcion, precio, moneda, imagen, creado_en AS "creadoEn";
    `;

    const result = await db.query(insertQuery, [nombre, descripcion, precio, moneda, imagen]);

    res.status(201).json({
      success: true,
      message: '¡Destino creado exitosamente!',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear destino:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el nuevo destino'
    });
  }
};

// 3. PUT /api/destinos/:id -> Actualizar un destino existente
const actualizarDestino = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, moneda, imagen } = req.body;

  try {
    const updateQuery = `
      UPDATE destinos
      SET 
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        precio = COALESCE($3, precio),
        moneda = COALESCE($4, moneda),
        imagen = COALESCE($5, imagen)
      WHERE id = $6
      RETURNING id, nombre, descripcion, precio, moneda, imagen;
    `;

    const result = await db.query(updateQuery, [nombre, descripcion, precio, moneda, imagen, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ningún destino con el ID ${id}.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Destino con ID ${id} actualizado con éxito.`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar destino:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el destino'
    });
  }
};

// 4. DELETE /api/destinos/:id -> Eliminar un destino
const eliminarDestino = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM destinos WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ningún destino con el ID ${id}.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Destino con ID ${id} eliminado exitosamente (y sus reservas asociadas si correspondía).`
    });
  } catch (error) {
    console.error('Error al eliminar destino:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el destino'
    });
  }
};

module.exports = {
  obtenerDestinos,
  crearDestino,
  actualizarDestino,
  eliminarDestino
};

