const db = require('./db');

const crearTablas = async () => {
  const queryDestinos = `
    CREATE TABLE IF NOT EXISTS destinos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      precio NUMERIC(10, 2) NOT NULL,
      moneda VARCHAR(3) DEFAULT 'ARS',
      imagen TEXT NOT NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const queryReservas = `
    CREATE TABLE IF NOT EXISTS reservas (
      id SERIAL PRIMARY KEY,
      nombre_cliente VARCHAR(100) NOT NULL,
      email_cliente VARCHAR(100) NOT NULL,
      destino_id INT REFERENCES destinos(id) ON DELETE CASCADE,
      fecha_viaje DATE NOT NULL,
      estado VARCHAR(20) DEFAULT 'confirmada',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(queryDestinos);
    await db.query(queryReservas);
    console.log('Tablas "destinos" y "reservas" listas en PostgreSQL.');

    // Insertamos datos iniciales de destinos si la tabla está vacía
    const result = await db.query('SELECT COUNT(*) FROM destinos');
    if (parseInt(result.rows[0].count) === 0) {
      const insertInicial = `
        INSERT INTO destinos (nombre, descripcion, precio, moneda, imagen) VALUES
        ('Bariloche Soñado', '5 días en San Carlos de Bariloche con excursiones y pases de esquí.', 1450000, 'ARS', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'),
        ('Cancún All Inclusive', '7 noches All Inclusive en Cancún frente al mar.', 3000, 'USD', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'),
        ('Río de Janeiro Express', '4 días con visitas al Cristo Redentor y Pan de Azúcar.', 900, 'USD', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325');
      `;
      await db.query(insertInicial);
      console.log(' Paquetes de muestra cargados a la base de datos.');
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error.message);
  }
};

module.exports = crearTablas;