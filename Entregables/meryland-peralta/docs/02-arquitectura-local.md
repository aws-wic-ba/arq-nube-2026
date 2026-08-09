# 02 — Arquitectura Local

## Servicios

La aplicación **SalonBook** se ejecuta utilizando **Docker Compose**, el cual levanta tres contenedores independientes.

| Contenedor | Imagen | Puerto | Función |
|------------|--------|:------:|---------|
| **frontend** | React | 3000 | Interfaz web utilizada por los clientes y administradores para gestionar reservas. |
| **backend** | Node.js / Express | 4000 | Procesa la lógica de negocio y expone la API REST utilizada por el frontend. |
| **db** | postgres:16-alpine | 5432 | Base de datos donde se almacenan usuarios, servicios y reservas. |

## Diagrama de Arquitectura Local

```text
                Browser
          http://localhost:3000
                   │
                   ▼
    ┌────────────────────────┐
    │      Frontend          │
    │        React           │
    │        :3000           │
    └──────────┬─────────────┘
               │ HTTP
               ▼
    ┌────────────────────────┐
    │       Backend          │
    │   Node.js / Express    │
    │        :4000           │
    └──────────┬─────────────┘
               │ DATABASE_URL
               ▼
    ┌────────────────────────┐
    │      PostgreSQL        │
    │         :5432          │
    └──────────┬─────────────┘
               │
      volume: postgres_data
```

## Cómo levantar la aplicación

Ejecutar el siguiente comando desde la carpeta del proyecto:

```bash
docker compose up --build
```

Una vez iniciados los contenedores, la aplicación estará disponible en:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000

## Cómo detener la aplicación

Para detener todos los contenedores:

```bash
docker compose down
```

## Eliminar también la base de datos

Si deseas detener la aplicación y eliminar también el volumen de PostgreSQL, ejecuta:

```bash
docker compose down -v
```