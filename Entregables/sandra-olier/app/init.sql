-- Crear tabla de reservas si no existe
CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_nombre VARCHAR(100) NOT NULL,
  cliente_email VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  personas INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba
INSERT INTO reservas (cliente_nombre, cliente_email, fecha, hora, personas)
VALUES
('Juan Pérez', 'juan@example.com', '2026-07-25', '20:00:00', 2),
('María Gómez', 'maria@example.com', '2026-07-26', '21:30:00', 4);
