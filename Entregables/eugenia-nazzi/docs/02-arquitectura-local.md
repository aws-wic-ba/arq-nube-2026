# 02 - Arquitectura Local

Arquitectura de tres servicios, que hacen a la funcionalidad base. Se busca la resiliencia haciendo que estas tres piezas se recuperen solas ante fallos. Adicionalmente, se agrega un cuarto componente para simular el servicio de envío de emails para poder testear durante el desarrollo.

## Servicios

| Servicio | Descripción | Imagen / Base | Puerto (host → contenedor) |
|---|---|---|---|
| `frontend` | Aplicación web (React) donde el usuario se registra, completa su planilla y consulta sus controles | `node:20-alpine` | `3000 → 3000` |
| `backend` | API REST que maneja la lógica: cálculo de planillas por edad/sexo, historial, notificaciones | `node:20-alpine`| `4000 → 4000` |
| `db` | Base de datos relacional | `postgres:16-alpine` | `5432 → 5432` |
| `mailhog` | Simulador envío de emails | `mailhog/mailhog:latest` | `1025 → 1025` y `8025 → 8025` para la interfaz web |

## Volúmenes

- `db_data`: volumen nombrado que persiste los datos de la DB entre reinicios del contenedor (`/var/lib/postgresql/data`), para no perder la información cargada cada vez que se reinicia el entorno.
- `./db/init.sql`: solo lectura, se monta en `/docker-entrypoint-initdb.d/init.sql` en la container 'db'. Se ejecuta solo la primera vez para crear el volumen, crear las tablas 'usuarios' y 'control_historial'.
- `./backend:/app`: monta el código del backend dentro del contenedor.
- `./frontend:/app`: ídem para el frontend.

## Mecanismos de resiliencia

Para que el entorno sea simple pero a la vez tolerante a fallos comunes, se incluyen en el `docker-compose.yml`:

- **`restart: unless-stopped`** en los tres servicios: si un contenedor se cae, Docker lo reinicia automáticamente sin intervención manual.
- **`healthcheck`** en `db` y `backend`:
  - `db` expone un healthcheck con `pg_isready` para que Docker sepa cuándo Postgres ya está listo para aceptar conexiones (no solo "iniciado", sino realmente disponible).
  - `backend` expone un endpoint `/health` que valida su propia conexión a la base antes de reportarse como saludable.
- **`depends_on: condition: service_healthy`**: el `backend` no arranca hasta que `db` esté levantado y saludable, y espera a que arranque `mailhog` a su vez. El `frontend` espera a que `backend` esté saludable. Esto evita errores de arranque.


## Instrucciones para levantar el entorno

1. Clonar el repositorio y ubicarse en la raíz del proyecto (donde está el `docker-compose.yml`).
2. Copiar el archivo de variables de entorno de ejemplo y levantar todos los servicios:
   ```bash
   docker compose up 
   ```
   (o `docker compose up -d` para correrlo en segundo plano)
3. Verificar que los contenedores estén corriendo y saludables:
   ```bash
   docker compose ps
   ```
4. Acceder a la app:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend (API): [http://localhost:4000](http://localhost:4000)
   - Mailhog (emails "enviados"): [http://localhost:8025](http://localhost:8025)
5. Para detener el entorno:
   ```bash
   docker compose down
   ```
   Para detenerlo y además borrar los volúmenes (¡OJO! reinicia la base de datos desde CERO):
   ```bash
   docker compose down -v
   ```

## Diagrama de conexión entre contenedores

```
                    ┌─────────────────────────────┐
                    │           Usuario           │
                    │        (navegador web)      │
                    └───────────────┬─────────────┘
                                    │  http://localhost:3000
                                    ▼
                    ┌─────────────────────────────┐
                    │       frontend (React)      │
                    │       contenedor :3000      │
                    │    restart: unless-stopped  │
                    └───────────────┬─────────────┘
                                    │  http://backend:4000
                                    │  (espera a que backend esté "healthy")  
                                    ▼
                    ┌─────────────────────────────┐
                    │            backend          │
                    │       contenedor :4000      │
                    │  *healthcheck: GET /health  │
                    │  *restart: unless-stopped   │
                    └──────┬─────────────────┬────┘
                           │                 │
              postgresql://db:5432     mailhog:1025
              (espera db "healthy")          │
                           │                 |
                           ▼                 ▼
          ┌─────────────────────────┐  ┌─────────────────────────┐
          │     db (PostgreSQL)     │  │       mailhog           │
          │     contenedor :5432    │  │  SMTP :1025 / web :8025 │
          │ *healthcheck:pg_isready │  │ *restart:unless-stopped │
          │ *restart:unless-stopped │  │                         │
          │    *volumen: db_data    │  │ (emails de prueba, se   │
          │   init: db/init.sql     │  │  pierden al reiniciar)  │
          └─────────────────────────┘  └─────────────────────────┘

```

Los cuatro servicios se comunican entre sí a través de la red interna, mientras que solo `frontend`, `backend` y `mailhog` exponen puertos hacia el host para ser accedidos desde el navegador. Es una arquitectura simple: cada servicio con un rol claro y necesario al core del funcionamiento esperado de la app. Cada paso valida que el servicio del que depende esté realmente disponible antes de operar, y cada contenedor se reinicia solo si falla.

**Nota 1:** Para usarlo necesitás tener en tu repo ./frontend/Dockerfile y ./backend/Dockerfile (el backend con un endpoint GET /health que devuelva 200 si la conexión a la DB está OK).

**Nota 2:** Para probarlo local sin usar un email real, voy a usar Mailhog (sugerido por Claude) que captura los emails 'disparados' por los eventos de notificacion y los muestra en una interfaz web, sin enviarlos de verdad —> en AWS después se reemplaza por un servicio de envío de notificaciones. 
 Si deseamos ver una simulacion del funcionamiento, se sugiere ingresar una fecha de control completa que 'se tenga que repetir' en la fecha actual. Ej: Me hice un control el 06-08-2025, y se repite anual, el 06-08-2026 debe avisarnos. Luego se ejecuta en bash el comando 'curl -X POST http://localhost:4000/api/recordatorios/ejecutar' y desde la interfaz de Mailhog (http://localhost:8025) ves el email "enviado".

**Nota 3:** Para migrar a AWS, el código del 'nodemailer' apuntando a un host/puerto SMTP por variables de entorno, solo debe cambiarse SMTP_HOST/SMTP_PORT/credenciales en las variables de entorno de ECS, sin tocar el código del backend. Y en vez de node-cron (digamos el job cron) corriendo dentro del contenedor, en AWS el disparo diario lo hace EventBridge Scheduler (como esta definido en 03-arquitectura-aws.md) utilizando mismo endpoint.