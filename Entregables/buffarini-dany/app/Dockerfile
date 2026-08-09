# ---------- Etapa 1: build ----------
FROM rust:1.82-slim-bookworm AS builder

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiamos todo el código (Cargo.toml, Cargo.lock, src/, migrations/, templates/, static/, .sqlx/)
COPY . .

# .sqlx/ contiene los metadatos offline de las queries (generados con `cargo sqlx prepare`),
# por eso el build NO necesita conexión a una base de datos real.
ENV SQLX_OFFLINE=true

RUN cargo build --release

# ---------- Etapa 2: runtime ----------
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Binario compilado
COPY --from=builder /usr/src/app/target/release/todo ./todo

# Archivos que la app lee en tiempo de ejecución (templates de Tera, css, páginas de error)
COPY --from=builder /usr/src/app/templates ./templates
COPY --from=builder /usr/src/app/static ./static

EXPOSE 10000

CMD ["./todo"]
