# 02 · Arquitectura local (Docker)

## Servicios

La app corre con **Docker Compose**, con dos contenedores:

| Servicio | Imagen                | Rol                                             | Puerto expuesto |
| -------- | ---------------------- | ------------------------------------------------ | --------------- |
| `db`     | `postgres:16-alpine`   | Base de datos PostgreSQL, guarda las tareas       | 5432             |
| `app`    | build local (Dockerfile)| Servidor web Rust (Actix-web), sirve la app y la lógica | 10000            |

## Cómo se conectan

![Diagrama de cómo se conectan los contenedores](como%20se%20conectan.png)



>  `app` depende de `db` (`depends_on` con `condition: service_healthy`): no arranca hasta que
  Postgres esté listo para aceptar conexiones (`pg_isready`).
>  `app` se conecta a `db` por el nombre del servicio (`db`), resuelto por la red interna que
  crea Docker Compose automáticamente — no hace falta configurar nada de networking a mano.
>  Los datos de Postgres persisten en un **volumen nombrado** (`db_data`), así que sobreviven a
  un `docker compose down` (se pierden solo con `docker compose down -v`).
>  El esquema de la tabla `tasks` se crea automáticamente la primera vez que se inicializa el
  volumen de Postgres, montando el `.sql` de migración en `/docker-entrypoint-initdb.d/`.

## Build de la imagen de la app

El `Dockerfile` de `app/` usa **build multi-stage**:

1. **Etapa `builder`** (`rust:1.82-slim-bookworm`): compila el binario en modo `release`.
   Usa metadatos offline de `sqlx` (carpeta `.sqlx/`) para no necesitar una base de datos real
   durante el build.
2. **Etapa final** (`debian:bookworm-slim`): copia solo el binario compilado y los archivos que
   la app necesita en runtime (`templates/`, `static/`) — la imagen final no tiene el toolchain
   de Rust, así que pesa mucho menos que si usáramos una sola etapa.

## Cómo levantarla

```bash
cd app/
docker compose up --build
```

Luego abrir `http://localhost:10000` en el navegador.

Para bajarla:

```bash
docker compose down
```


