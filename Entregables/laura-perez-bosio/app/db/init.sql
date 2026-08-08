-- Esquema inicial de la tienda. Se ejecuta automaticamente la primera vez
-- que arranca el contenedor de Postgres (docker-entrypoint-initdb.d).

CREATE TABLE productos (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(120)   NOT NULL,
  descripcion TEXT,
  precio      NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
  stock       INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
  imagen      VARCHAR(255)
);

-- El carrito vive en la base y no en la memoria del servidor. Asi sobrevive a
-- que se caiga una instancia y tambien a que la persona cierre el navegador.
-- El navegador solo guarda el token en una cookie firmada.
CREATE TABLE carritos (
  id             SERIAL PRIMARY KEY,
  token          VARCHAR(64)  NOT NULL UNIQUE,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE carrito_items (
  id          SERIAL  PRIMARY KEY,
  carrito_id  INTEGER NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  UNIQUE (carrito_id, producto_id)
);

CREATE INDEX idx_carrito_items_carrito ON carrito_items(carrito_id);

CREATE TABLE pedidos (
  id           SERIAL PRIMARY KEY,
  fecha        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  total        NUMERIC(10, 2) NOT NULL,
  estado       VARCHAR(20)    NOT NULL DEFAULT 'confirmado'
);

CREATE TABLE pedido_items (
  id             SERIAL PRIMARY KEY,
  pedido_id      INTEGER        NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id    INTEGER        NOT NULL REFERENCES productos(id),
  cantidad       INTEGER        NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10, 2) NOT NULL
);

CREATE INDEX idx_pedido_items_pedido ON pedido_items(pedido_id);

-- Productos
INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES
  ('Auriculares inalambricos', 'Bluetooth 5.3, cancelacion de ruido, 30h de bateria', 89999.00, 12, 'auriculares'),
  ('Teclado mecanico',         'Switches rojos, retroiluminado RGB, layout espanol',   74500.00,  8, 'teclado'),
  ('Mouse ergonomico',         'Vertical, 6 botones, sensor de 4000 DPI',              32000.00, 25, 'mouse'),
  ('Monitor 27 pulgadas',      'IPS 2K, 165Hz, altura regulable',                     419000.00,  4, 'monitor'),
  ('Webcam Full HD',           '1080p 60fps, microfono estereo, tapa de privacidad',   45900.00, 15, 'webcam'),
  ('Silla de escritorio',      'Malla transpirable, soporte lumbar, apoyabrazos 3D',  289000.00,  3, 'silla');

-- Historial de pedidos ya cerrados. Sirve para que el recomendador de
-- "quien compro esto tambien compro" tenga datos desde el primer arranque.
-- No afectan el stock actual: son ventas viejas ya descontadas.
INSERT INTO pedidos (id, fecha, total, estado) VALUES
  (1, NOW() - INTERVAL '40 days', 106500.00, 'confirmado'),
  (2, NOW() - INTERVAL '33 days', 106500.00, 'confirmado'),
  (3, NOW() - INTERVAL '27 days', 196499.00, 'confirmado'),
  (4, NOW() - INTERVAL '21 days', 525500.00, 'confirmado'),
  (5, NOW() - INTERVAL '16 days', 135899.00, 'confirmado'),
  (6, NOW() - INTERVAL '11 days', 135899.00, 'confirmado'),
  (7, NOW() - INTERVAL  '6 days', 708000.00, 'confirmado'),
  (8, NOW() - INTERVAL  '2 days', 708000.00, 'confirmado');

INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES
  (1, 2, 1,  74500.00), (1, 3, 1,  32000.00),
  (2, 2, 1,  74500.00), (2, 3, 1,  32000.00),
  (3, 2, 1,  74500.00), (3, 3, 1,  32000.00), (3, 1, 1,  89999.00),
  (4, 4, 1, 419000.00), (4, 2, 1,  74500.00), (4, 3, 1,  32000.00),
  (5, 1, 1,  89999.00), (5, 5, 1,  45900.00),
  (6, 1, 1,  89999.00), (6, 5, 1,  45900.00),
  (7, 6, 1, 289000.00), (7, 4, 1, 419000.00),
  (8, 4, 1, 419000.00), (8, 6, 1, 289000.00);

-- Como inserte los pedidos con id explicito, adelanto las secuencias para que
-- los pedidos nuevos no choquen con estos.
SELECT setval('pedidos_id_seq',       (SELECT MAX(id) FROM pedidos));
SELECT setval('pedido_items_id_seq',  (SELECT MAX(id) FROM pedido_items));
