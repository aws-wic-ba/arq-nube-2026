# RelocaPet

Proyecto Final Arquitectura de Computación en la Nube 2026 por AWS Women In Cloud Buenos Aires y la Universidad de la Marina Mercante.

RelocaPet centraliza los requisitos para mudarte a otro país con tu mascota: qué necesitás para salir del país de origen, qué necesitás para entrar al país
de destino, qué política tiene cada aerolínea, y qué experiencia tuvieron otras personas que ya hicieron esa misma ruta.

1. **Buscador de requisitos por ruta**: elegís país de origen, país de destino y especie, y te arma el checklist de requisitos de salida y de entrada, más
   las aerolíneas que cubren esa ruta y sus políticas de traslado de mascotas.
2. **Experiencias de otros**: listado de tips de personas que ya hicieron esa ruta, con posibilidad de sumar la propia.

_Esta app no requiere login/autenticación._

## Stack

| Capa          | Tecnología                                  |
| ------------- | ------------------------------------------- |
| Frontend      | React + Vite (SPA, consume la API por HTTP) |
| Backend       | Node.js + Express (API REST)                |
| ORM           | Prisma                                      |
| Base de datos | PostgreSQL 16                               |

## Estructura

```
app/
├── web/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Buscador.jsx      # Página 1: checklist por ruta
│   │   │   └── Tips.jsx          # Página 2: experiencias de otros
│   │   ├── components/Navbar.jsx
│   │   ├── api.js                # Cliente HTTP hacia la API
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── Dockerfile
├── api/                           # Backend (Node + Express)
│   ├── src/
│   │   ├── routes/                (paises, especies, requisitos, aerolineas, tips)
│   │   ├── db.js                 # Cliente Prisma
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma         # Modelo de datos
│   │   └── seed.js                # Datos de ejemplo
│   └── Dockerfile
└── docker-compose.yml
```

## Modelo de datos

- **Pais**: nombre, código ISO
- **Especie**: nombre (Perro, Gato)
- **Requisito**: asociado a un país + especie, con tipo `SALIDA` o `ENTRADA`, descripción y plazo en días de anticipación cuando aplica (ej. "vacuna
  antirrábica, 21 días antes del viaje")
- **Aerolinea**: nombre, si admite cabina/bodega, restricciones de raza
- **AerolineaRuta**: qué aerolíneas cubren un par origen→destino
- **Tip**: experiencia de un usuario para una ruta (origen, destino, especie),
  con calificación de dificultad (1-5)

## Arquitectura local (Docker)

La app corre 100% local con **tres contenedores** definidos en `docker-compose.yml`:

| Servicio | Imagen / build                                      | Puerto (host → contenedor) | Rol                                 |
| -------- | --------------------------------------------------- | -------------------------- | ----------------------------------- |
| `web`    | build a partir de `web/Dockerfile` (React + Vite)   | `5173 → 5173`              | Sirve el frontend                   |
| `api`    | build a partir de `api/Dockerfile` (Node + Express) | `3000 → 3000`              | API REST, accede a la base de datos |
| `db`     | `postgres:16-alpine`                                | `5432 → 5432`              | Base de datos PostgreSQL            |

- **Red**: docker-compose crea una red interna donde `api` se conecta a `db` usando el nombre del servicio como host (`db:5432`). El `DATABASE_URL` de `api` se arma a partir de las variables `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` del `.env`.
- **`web` no habla con `db` directamente ni corre dentro de la red interna para ese propósito**: el navegador del usuario descarga el bundle estático de React desde el contenedor `web`, y ese código hace `fetch` HTTP hacia `api` a través del puerto publicado en el host (`http://localhost:3000`).
- **Volumen**: `postgres_data` persiste los datos de Postgres en disco.

## Cómo correrlo con Docker

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

2. Levantá los tres servicios (`web` + `api` + `db`):

   ```bash
   docker compose up --build
   ```

3. En otra terminal, con los contenedores corriendo, creá las tablas y cargá
   los datos de ejemplo dentro del contenedor de la API:

   ```bash
   docker compose exec api npx prisma db push
   docker compose exec api npm run seed
   ```

4. Abrí **http://localhost:5173** en el navegador.

Para detener todo: `docker compose down` (agregar `-v` si además querés borrar
el volumen de datos de Postgres).
