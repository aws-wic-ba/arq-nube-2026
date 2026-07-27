# 02 — Arquitectura local

## Servicios

La app corre con dos contenedores Docker:

| Contenedor | Imagen | Puerto |
|------------|--------|--------|
| `app` | Node.js custom | 3000 |
| `db` | postgres:16-alpine | 5432 |

## Diagrama local

```
Browser (localhost:3000)
        │
        ▼
  ┌─────────────┐
  │   app       │  Node.js / Express
  │  :3000      │
  └──────┬──────┘
         │ DATABASE_URL
         ▼
  ┌─────────────┐
  │    db       │  PostgreSQL 16
  │  :5432      │
  └─────────────┘
        │
   [volume: postgres_data]
```

## Cómo levantar la app

```bash
cd app/
docker compose up --build
```

La app queda disponible en `http://localhost:3000`.

Para detenerla:

```bash
docker compose down
```

Para detenerla y borrar los datos:

```bash
docker compose down -v
```
