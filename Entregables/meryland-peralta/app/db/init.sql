-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    appointment_date TIMESTAMP NOT NULL,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
);

-- Servicios iniciales
INSERT INTO services (name, price)
VALUES
    ('Corte de cabello', 25.00),
    ('Manicure', 35.00),
    ('Pedicure', 40.00),
    ('Tinturado', 80.00)
ON CONFLICT DO NOTHING;