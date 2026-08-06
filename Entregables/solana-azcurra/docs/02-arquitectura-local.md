# 02 — Arquitectura local

## Servicios

La app corre con dos contenedores Docker:

| Contenedor | Imagen | Puerto |
|------------|--------|--------|
| `app` | Node.js custom | 3000 |
| `db` | postgres:16-alpine | 5432 |

El contenedor `app` es el servidor web de EcoCanje (páginas de publicaciones y de canje de puntos). El contenedor `db` guarda los datos: usuarios, publicaciones de material, transacciones, puntos y productos para canjear.

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

Los datos de PostgreSQL se guardan en un volumen (`postgres_data`) para que no se pierdan al reiniciar los contenedores.

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
