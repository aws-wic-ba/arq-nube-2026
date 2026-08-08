-- Esquema Aura: usuarios, eventos, tipos de entrada y órdenes de compra.
-- Diseñado para PostgreSQL 15+.

-- ---------------------------------------------------------------------------
-- A. Usuarios
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,  -- hash (bcrypt/argon2), nunca texto plano
    foto_perfil     TEXT,                   -- URL o ruta de la imagen
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);


-- ---------------------------------------------------------------------------
-- B. Eventos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
    id              SERIAL PRIMARY KEY,
    titulo          VARCHAR(200) NOT NULL,
    descripcion     TEXT NOT NULL,
    imagen_portada  TEXT,
    categoria       VARCHAR(50) NOT NULL,   -- música, tecnología, deportes, etc.
    fecha_inicio    TIMESTAMPTZ NOT NULL,
    fecha_cierre    TIMESTAMPTZ NOT NULL,
    modalidad       VARCHAR(20) NOT NULL
                        CHECK (modalidad IN ('presencial', 'virtual')),

    -- Solo si modalidad = 'presencial'
    direccion       TEXT,
    ciudad          VARCHAR(100),
    pais            VARCHAR(100),
    latitud         NUMERIC(10, 7),
    longitud        NUMERIC(10, 7),

    -- Solo si modalidad = 'virtual'
    enlace_acceso   TEXT,

    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (fecha_cierre > fecha_inicio),

    -- Coherencia modalidad / ubicación / enlace
    CHECK (
        (
            modalidad = 'presencial'
            AND direccion IS NOT NULL
            AND ciudad IS NOT NULL
            AND pais IS NOT NULL
            AND latitud IS NOT NULL
            AND longitud IS NOT NULL
            AND enlace_acceso IS NULL
        )
        OR
        (
            modalidad = 'virtual'
            AND enlace_acceso IS NOT NULL
            AND direccion IS NULL
            AND ciudad IS NULL
            AND pais IS NULL
            AND latitud IS NULL
            AND longitud IS NULL
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos (categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_fechas ON eventos (fecha_inicio, fecha_cierre);
CREATE INDEX IF NOT EXISTS idx_eventos_ciudad ON eventos (ciudad);


-- ---------------------------------------------------------------------------
-- C. Tipos de entrada (tickets) por evento
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipos_entrada (
    id                  SERIAL PRIMARY KEY,
    evento_id           INTEGER NOT NULL REFERENCES eventos (id) ON DELETE CASCADE,
    nombre              VARCHAR(100) NOT NULL,  -- General, VIP, Entrada Gratuita...
    precio              NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    stock_maximo        INTEGER NOT NULL CHECK (stock_maximo >= 0),
    stock_vendido       INTEGER NOT NULL DEFAULT 0 CHECK (stock_vendido >= 0),
    fecha_limite_venta  TIMESTAMPTZ,

    CHECK (stock_vendido <= stock_maximo),
    UNIQUE (evento_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_tipos_entrada_evento ON tipos_entrada (evento_id);


-- ---------------------------------------------------------------------------
-- D. Órdenes / transacciones de pago
-- Ligadas estrictamente a un usuario + un evento + un tipo de entrada.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordenes (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER NOT NULL REFERENCES usuarios (id),
    evento_id        INTEGER NOT NULL REFERENCES eventos (id),
    tipo_entrada_id  INTEGER NOT NULL REFERENCES tipos_entrada (id),
    cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
    monto_total      NUMERIC(12, 2) NOT NULL CHECK (monto_total >= 0),
    estado_pago      VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                         CHECK (estado_pago IN ('completado', 'pendiente', 'reembolsado')),
    codigo_unico     VARCHAR(64) NOT NULL UNIQUE,  -- código de ingreso
    codigo_qr        TEXT,                         -- payload/URL del QR
    fecha_compra     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_usuario ON ordenes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_evento ON ordenes (evento_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes (estado_pago);
CREATE INDEX IF NOT EXISTS idx_ordenes_tipo_entrada ON ordenes (tipo_entrada_id);

