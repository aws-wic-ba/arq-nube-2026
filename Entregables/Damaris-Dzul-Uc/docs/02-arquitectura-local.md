# Arquitectura local

App de becas universitarias del ayuntamiento de Hunucmá, Yucatán, México.

## Servicios (Docker Compose)

| Servicio | Imagen | Puerto host | Descripción |
|----------|--------|-------------|-------------|
| `web` | build propio (Node 20 + Express) | `3000` | App web: formulario de solicitante, panel de trabajador, validación de documentos |
| `db` | `postgres:16-alpine` | `5432` | Base de datos relacional: solicitudes y documentos |

## Volúmenes

| Volumen | Punto de montaje | Para qué |
|---------|-------------------|----------|
| `db_data` | `/var/lib/postgresql/data` | Persistencia de la base entre reinicios del contenedor |
| `uploads_data` | `/app/uploads` | Persistencia de los archivos subidos (INE, actas, etc.) |
| `./init.sql` | `/docker-entrypoint-initdb.d/init.sql` | Crea las tablas la primera vez que arranca `db` |
| `./src`, `./public` | `/app/src`, `/app/public` | Bind mount para desarrollo: cambios se ven sin rebuild (`web` corre con `nodemon`) |

## Variables de entorno

| Variable | Para qué | Valor en local |
|----------|----------|-----------------|
| `DATABASE_URL` | Conexión a Postgres | Definida en `docker-compose.yml` |
| `SESSION_SECRET` | Firma la cookie de sesión (`express-session`) | Valor de desarrollo en `docker-compose.yml`; en AWS vendría de Secrets Manager (ver `03-arquitectura-aws.md`) |

## Cuentas de usuario

Cada solicitante crea una cuenta con solo correo y contraseña (`/registro`). La contraseña se guarda con hash (`bcryptjs`), nunca en texto plano. Al crear la cuenta se arma automáticamente su solicitud (en borrador) y queda logueado (`/login` para sesiones futuras, cookie server-side con `express-session`).

Ya adentro, `/panel` tiene dos pestañas sobre esa misma solicitud:
- **Datos personales** (`/panel/datos`): nombre, apellido, CURP, promedio, si ya se graduó, teléfono, escuela.
- **Subir documentos** (`/panel/documentos`): INE, acta de nacimiento, comprobante de estudios, comprobante de domicilio, carta de estatus socioeconómico, carta de motivos.

El panel de trabajador (`/trabajador`) no requiere cuenta en esta versión del TP.

En la página de inicio, antes de iniciar sesión, hay un link a `public/convocatoria.pdf` con el detalle completo de la convocatoria (objetivo, requisitos, documentos, proceso de selección).

## Cómo levantarla

```bash
cd Entregables/Damaris-Dzul-Uc/app
docker compose up
```

- Formulario de solicitante: http://localhost:3000
- Panel de trabajador: http://localhost:3000/trabajador

`web` espera a que `db` esté `healthy` (`depends_on` + `healthcheck` con `pg_isready`) antes de arrancar, para no fallar la conexión en el primer boot.

## Diagrama de contenedores

```
┌─────────────────────────────────────────────┐
│                 Docker host                  │
│                                               │
│   ┌────────────┐        ┌────────────────┐  │
│   │  navegador  │ :3000  │   web (Node)   │  │
│   │  (usuario)  ├───────►│   Express+EJS  │  │
│   └────────────┘        └───────┬────────┘  │
│                                  │ :5432      │
│                                  ▼            │
│                          ┌────────────────┐  │
│                          │  db (Postgres) │  │
│                          └───────┬────────┘  │
│                                  │            │
│                          ┌───────▼────────┐  │
│                          │  db_data (vol) │  │
│                          └────────────────┘  │
│                                               │
│   ┌────────────────┐                         │
│   │ uploads_data    │◄──── web guarda/lee     │
│   │ (vol)           │      documentos         │
│   └────────────────┘                         │
└─────────────────────────────────────────────┘
```

> Versión imagen para `diagrams/arquitectura-local.png`: mismo esquema hecho en draw.io.
