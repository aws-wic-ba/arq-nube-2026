CREATE DATABASE IF NOT EXISTS peluapp;
USE peluapp;

CREATE TABLE IF NOT EXISTS professionals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(40),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_client_email (email)
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  professional_id INT NOT NULL,
  service_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('reservado','cancelado','completado') NOT NULL DEFAULT 'reservado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointment_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_appointment_professional FOREIGN KEY (professional_id) REFERENCES professionals(id),
  CONSTRAINT fk_appointment_service FOREIGN KEY (service_id) REFERENCES services(id),
  INDEX idx_availability (professional_id, appointment_date, appointment_time, status)
);

-- Datos iniciales para que los desplegables estén disponibles desde el primer arranque.
INSERT INTO professionals (name, specialty)
SELECT 'Sofía', 'Coloración'
WHERE NOT EXISTS (SELECT 1 FROM professionals WHERE name = 'Sofía');

INSERT INTO professionals (name, specialty)
SELECT 'Martín', 'Cortes'
WHERE NOT EXISTS (SELECT 1 FROM professionals WHERE name = 'Martín');

INSERT INTO professionals (name, specialty)
SELECT 'Valentina', 'Peinados'
WHERE NOT EXISTS (SELECT 1 FROM professionals WHERE name = 'Valentina');

INSERT INTO services (name, duration_minutes, price)
SELECT 'Corte', 60, 8500.00
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Corte');

INSERT INTO services (name, duration_minutes, price)
SELECT 'Corte + brushing', 60, 11000.00
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Corte + brushing');

INSERT INTO services (name, duration_minutes, price)
SELECT 'Coloración', 120, 22000.00
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Coloración');

INSERT INTO services (name, duration_minutes, price)
SELECT 'Peinado', 60, 12000.00
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Peinado');
