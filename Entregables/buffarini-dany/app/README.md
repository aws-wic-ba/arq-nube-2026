# Actix Todo (Rust)

Aplicación de lista de tareas (to-do list) escrita en **Rust** con:

- [Actix-web](https://actix.rs/) — framework HTTP
- [sqlx](https://github.com/launchbadge/sqlx) + **PostgreSQL** — acceso a datos
- [Tera](https://keats.github.io/tera/) — motor de templates HTML

Permite crear tareas, marcarlas como completadas y borrarlas, todo desde una única página (`/`).

## Origen

Basada en el ejemplo oficial [`actix/examples/actix_todo`](https://github.com/actix/examples/tree/master/actix_todo),
tomado de su fork [`render-examples/actix_todo`](https://github.com/render-examples/actix_todo).
Publicado bajo licencia MIT (ver `LICENSE`). Se le agregó Dockerfile y docker-compose para
este trabajo práctico.

## Cómo correrla localmente

```bash
docker compose up --build
```

Esto levanta dos contenedores:

- `db`: Postgres 16, con la tabla `tasks` creada automáticamente al iniciar.
- `app`: la aplicación Rust, escuchando en `http://localhost:10000`.

Abrí `http://localhost:10000` en el navegador.

## Nota sobre sqlx y el build

Este proyecto usa las macros `sqlx::query!` / `sqlx::query_as!`, que normalmente necesitan
una base de datos disponible **en tiempo de compilación** para validar las consultas SQL.
Para que el `docker build` no dependa de tener Postgres corriendo en ese momento, se generó
la carpeta `.sqlx/` (metadatos offline, con `cargo sqlx prepare`) y el Dockerfile compila
con `SQLX_OFFLINE=true`.
