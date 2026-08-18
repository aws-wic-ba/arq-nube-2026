-- Esquema de la base de datos de Roversec (tienda de cursos de ciberseguridad)
CREATE TABLE IF NOT EXISTS cursos (
  id          SERIAL PRIMARY KEY,
  titulo      TEXT NOT NULL,
  nivel       TEXT NOT NULL,          -- 'inicial' | 'intermedio' | 'avanzado'
  precio      INTEGER NOT NULL,       -- en pesos argentinos
  descripcion TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  duracion    TEXT NOT NULL           -- ej: "12 h"
);

CREATE TABLE IF NOT EXISTS compras (
  id             SERIAL PRIMARY KEY,
  cliente_nombre TEXT NOT NULL,
  cliente_email  TEXT NOT NULL,
  total          INTEGER NOT NULL,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compra_items (
  id              SERIAL PRIMARY KEY,
  compra_id       INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  curso_id        INTEGER NOT NULL REFERENCES cursos(id),
  precio_unitario INTEGER NOT NULL
);
