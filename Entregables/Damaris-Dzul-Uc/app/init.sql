CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solicitudes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    apellido VARCHAR(100) NOT NULL DEFAULT '',
    fecha_nacimiento DATE,
    sexo VARCHAR(30) NOT NULL DEFAULT '',
    estado_civil VARCHAR(30) NOT NULL DEFAULT '',
    curp VARCHAR(18) NOT NULL DEFAULT '',
    telefono VARCHAR(20) NOT NULL DEFAULT '',
    domicilio VARCHAR(300) NOT NULL DEFAULT '',
    escuela VARCHAR(200) NOT NULL DEFAULT '',
    carrera VARCHAR(150) NOT NULL DEFAULT '',
    semestre VARCHAR(30) NOT NULL DEFAULT '',
    matricula VARCHAR(50) NOT NULL DEFAULT '',
    modalidad VARCHAR(30) NOT NULL DEFAULT '',
    promedio NUMERIC(4,2),
    ya_graduo BOOLEAN NOT NULL DEFAULT false,
    acepta_actividades BOOLEAN NOT NULL DEFAULT false,
    estado VARCHAR(20) NOT NULL DEFAULT 'incompleta',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    filename VARCHAR(300) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (solicitud_id, tipo)
);
