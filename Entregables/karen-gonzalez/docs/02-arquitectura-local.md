# 02 — Arquitectura local

## Servicios

La app corre con tres contenedores Docker:

| Contenedor | Imagen | Puerto |
|------------|--------|--------|
| `frontend` | Nginx (custom) | 80 |
| `backend` | Python 3.11 / FastAPI (custom) | 8000 (interno) |
| `db` | postgis/postgis:15-3.3-alpine | 5432 |


## Diagrama local

```
Browser (localhost:80)
        │
        ▼
  ┌─────────────┐
  │   frontend  │  Nginx / Web estática
  │  :3000      │  (Proxy inverso a /api/*)
  └──────┬──────┘
         │ http://backend:8000
         ▼
  ┌─────────────┐
  │   backend   │  Python 3.11 / FastAPI
  │  :3000      │  
  └──────┬──────┘
         │  DB_HOST=db
         ▼
  ┌─────────────┐
  │    db       │  PostgreSQL 15 + PostGIS
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

La app queda disponible en `http://localhost:80`.

Para detenerla:

```bash
docker compose down
```

Para detenerla y borrar los datos:

```bash
docker compose down -v
```
