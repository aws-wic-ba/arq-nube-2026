# 02 — Arquitectura local

## Cómo corre la app

La app es un único servicio Flask (Python) con una base de datos SQLite embebida. Se levanta con Docker Compose en un solo comando:

```bash
docker compose up
```

Y queda disponible en `http://localhost:5000`.

## Servicios y puertos

| Servicio | Descripción                          | Puerto host → contenedor |
|----------|---------------------------------------|---------------------------|
| `web`    | App Flask (dashboard + formulario)    | `5000 → 5000`              |

Es un solo contenedor porque el alcance de la app no justifica separar
frontend/backend ni una base de datos como servicio aparte: SQLite corre
embebido en el mismo proceso de Flask.

## Volúmenes

```yaml
volumes:
  - ./data:/app/data
```

El archivo `panel.db` se guarda en `./data`, fuera del contenedor. Esto es a
propósito: si el contenedor se recrea (`docker compose up --build`, por
ejemplo), los datos cargados no se pierden, porque el volumen vive en el
filesystem del host, no dentro de la imagen.

## Diagrama de conexión

```
┌─────────────────────────────────────────────┐
│                 Tu navegador                 │
└───────────────────────┬───────────────────────┘
                         │ http://localhost:5000
                         ▼
┌─────────────────────────────────────────────┐
│         Contenedor "web" (Docker)            │
│  ┌─────────────────────────────────────────┐ │
│  │  Flask (app.py)                          │ │
│  │  - Rutas internas: /, /cliente/*         │ │
│  │  - Ruta pública: /valorar/<id>           │ │
│  └─────────────────────────────────────────┘ │
└───────────────────────┬───────────────────────┘
                         │ lee/escribe
                         ▼
              ./data/panel.db (SQLite)
              — volumen persistente —
```
