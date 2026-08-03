# 02 — Arquitectura local

## Servicios

La app corre 100% local con **tres contenedores** definidos en `docker-compose.yml`:

| Servicio | Imagen / build                             | Puerto (host → contenedor) | Rol                                            |
| -------- | ------------------------------------------ | -------------------------- | ---------------------------------------------- |
| `web`    | build de `web/Dockerfile` (React + Vite)   | `5173 → 5173`              | Sirve el frontend (SPA)                        |
| `api`    | build de `api/Dockerfile` (Node + Express) | `3000 → 3000`              | API REST, accede a la base de datos vía Prisma |
| `db`     | `postgres:16-alpine`                       | `5432 → 5432`              | Base de datos PostgreSQL                       |

## Cómo se conectan

```
                    ┌───────────────────────┐
                    │        Browser         │
                    │       (usuario)        │
                    └───────────┬────────────┘
                                │
            ┌───────────────────┴────────────────────┐
            │ http://localhost:5173                   │ fetch http://localhost:3000/api/*
            ▼                                          ▼
 ┌─────────────────────┐                  ┌──────────────────────┐
 │  web (React + Vite)  │                  │  api (Node + Express) │
 │     puerto 5173      │                  │      puerto 3000      │
 └─────────────────────┘                  └───────────┬───────────┘
                                                        │ Prisma (DATABASE_URL)
                                                        │ host interno: db:5432
                                                        ▼
                                            ┌──────────────────────┐
                                            │   db (Postgres 16)    │
                                            │      puerto 5432      │
                                            │ volumen: postgres_data│
                                            └──────────────────────┘
```

- **Red interna**: `docker-compose` crea una red donde `api` se conecta a `db` usando el nombre del servicio como host (`db:5432`). El `DATABASE_URL` de `api` se arma a partir de las variables `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` definidas en `.env`.
- **`web` no accede a `db` directamente**: el navegador descarga el bundle estático de React desde el contenedor `web`, y ese código corre en el navegador del usuario, haciendo `fetch` HTTP hacia `api` a través del puerto publicado en el host (`http://localhost:3000`).
- **Volumen**: `postgres_data` persiste los datos de Postgres en disco, para que no se pierdan al reiniciar el contenedor `db`.

## Cómo levantarla

Requisitos: Docker y Docker Compose.

1. Creá un archivo `.env` en `/app` con las siguientes variables de entorno. Los valores se comparten en texto plano directamente en este README porque es un proyecto educativo, en un entorno real nunca deberían versionarse ni exponerse así:

   ```
   touch .env
   ```

   ```
   POSTGRES_USER=relocapet
   POSTGRES_PASSWORD=relocapet
   POSTGRES_DB=relocapet
   ```

2. Levantá los tres servicios (web + api + db):

   ```bash
   docker compose up --build
   ```

3. En otra terminal, con los contenedores corriendo, creá las tablas y cargá los datos de ejemplo dentro del contenedor de la API:

   ```bash
   docker compose exec api npx prisma db push
   docker compose exec api npm run seed
   ```

4. Abrí **http://localhost:5173** en el navegador.

Para detener todo: `docker compose down` (agregá `-v` si además querés borrar el volumen de datos de Postgres).
