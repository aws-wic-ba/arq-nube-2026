-- Tablas de EcoCanje

CREATE TABLE vecinos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  puntos INT NOT NULL DEFAULT 0
);

CREATE TABLE publicaciones (
  id SERIAL PRIMARY KEY,
  vecino_id INT NOT NULL REFERENCES vecinos(id),
  material TEXT NOT NULL CHECK (material IN ('plastico', 'papel_carton', 'vidrio')),
  emprendedor TEXT,
  confirmo_vecino BOOLEAN NOT NULL DEFAULT FALSE,
  confirmo_emprendedor BOOLEAN NOT NULL DEFAULT FALSE,
  estado TEXT NOT NULL DEFAULT 'publicada' CHECK (estado IN ('publicada', 'en_proceso', 'finalizada'))
);

CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  comercio TEXT NOT NULL,
  nombre TEXT NOT NULL,
  costo_puntos INT NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE
);

-- Datos de ejemplo para poder probar la app

INSERT INTO vecinos (nombre, puntos) VALUES
  ('María González', 15),
  ('Juan Pérez', 5);

INSERT INTO productos (comercio, nombre, costo_puntos) VALUES
  ('Almacén La Esquina', 'Bolsa de verduras', 10),
  ('Vivero El Tallo', 'Plantín de albahaca', 5),
  ('Panadería Doña Rosa', 'Docena de facturas', 15);
