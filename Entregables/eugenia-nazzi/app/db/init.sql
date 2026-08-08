-- Se ejecuta automáticamente la primera vez que se crea el volumen de la base
-- (Postgres corre todo lo que esté en /docker-entrypoint-initdb.d solo si el
-- data directory está vacío, es decir, la primera vez que se levanta el contenedor).

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  fecha_nacimiento DATE NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('mujer', 'varon')),
  creado_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS controles_historial (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,           -- id del catálogo (ej. 'pap-vph') o 'manual-<timestamp>'
  nombre TEXT NOT NULL,            -- nombre legible (denormalizado, útil para ítems manuales)
  categoria TEXT NOT NULL,         -- 'vacuna' | 'control' | 'manual'
  completado BOOLEAN NOT NULL DEFAULT false,
  fecha_realizado DATE,
  frecuencia_meses INTEGER,        -- frecuencia efectiva (sugerida o editada por el usuario); NULL = esquema único
  no_aplica BOOLEAN NOT NULL DEFAULT false,  -- el usuario indicó que este control no le corresponde
  proximo_control DATE,
  notificado_en TIMESTAMP,         -- se completa cuando ya se envió el email de recordatorio
  actualizado_en TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, item_id)     -- permite upsert: un registro por ítem y usuario
);

CREATE INDEX IF NOT EXISTS idx_historial_usuario ON controles_historial(usuario_id);
