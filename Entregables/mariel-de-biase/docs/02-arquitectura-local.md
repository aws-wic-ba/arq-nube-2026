# 02 — Arquitectura local

## Servicios

La app corre con dos contenedores Docker:

| Contenedor | Imagen | Puerto |
|---|---|---|
| `web` | Python 3.12 custom (Flask) | 5000 |
| `db` | `postgres:16-alpine` | 5432 |

## Diagrama local

```
Browser (localhost:5000)
      │
      ▼
┌────────────┐
│    web     │   Flask (Python)
│   :5000    │
└─────┬──────┘
      │ DATABASE_URL
      ▼
┌────────────┐
│     db     │   PostgreSQL 16
│   :5432    │
└─────┬──────┘
      │
[volume: db_data]
```

## Cómo levantar la app

```
cd app/
docker compose up --build
```

La app queda disponible en `http://localhost:5000`.

La primera vez, además, hay que cargar los usuarios de ejemplo:

```
docker compose exec web flask seed
```

> **Nota:** esto es así porque se trata de una demo simplificada para el
> TP. En una versión completa, la app tendría una sección de **registro de
> usuario** (padre/madre creando su cuenta y agregando a sus hijos), y no
> se cargarían usuarios de prueba con un comando manual.

Para detenerla:

```
docker compose down
```

Para detenerla y borrar los datos:

```
docker compose down -v
```