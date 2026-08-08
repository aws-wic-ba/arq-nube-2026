# 02 — Arquitectura local

## Servicios

La app corre con dos contenedores Docker:

| Contenedor | Imagen | Puerto |
|------------|--------|--------|
| `frontend` | nginx:1.27-alpine (custom) | 8080 |
| `db` | postgres:15-alpine | 5433 |

## Diagrama local

```
Browser (localhost:8080)
        │
        ▼
  ┌─────────────┐
  │  frontend   │  nginx (HTML estático)
  │  :8080      │
  └─────────────┘

  ┌─────────────┐
  │     db      │  PostgreSQL 15
  │  :5433      │
  └─────────────┘
        │
   [volume: postgres_data]
        │
   schema.sql (init automático)
```

> El frontend actual sirve `frontend/index.html` con datos de ejemplo en el navegador. La base queda disponible para conectar un backend cuando se implemente.

## Credenciales de la base (defaults)

| Variable | Valor |
|----------|-------|
| Usuario | `aura` |
| Contraseña | `aura_secret` |
| Base de datos | `aura` |
| Host | `localhost` |
| Puerto | `5433` |

Cadena de conexión de ejemplo:

```
postgresql://aura:aura_secret@localhost:5433/aura
```

## Cómo levantar la app

Desde la raíz del proyecto:

```bash
docker compose -f Entregables/Karen-Salinas/app/docker-compose.yml up 
--build
```

La app queda disponible en http://localhost:8080.

Para detenerla:

```bash
docker compose down
```

Para detenerla y borrar los datos:

```bash
docker compose down -v
```

## Estructura del proyecto

```
app/
├── backend/
│   └── schema.sql      # Esquema PostgreSQL (tablas y índices)
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── index.html      # Landing de Aura
└── docker-compose.yml
```
