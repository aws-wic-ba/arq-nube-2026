# 02 — Arquitectura local

## Cómo funciona localmente

Para ejecutar CloudDesk de forma local utilicé Docker Compose. Elegí Docker porque permite levantar la aplicación y su base de datos de manera consistente, sin tener que instalar y configurar manualmente todas las dependencias en cada computadora.

La arquitectura local está formada por dos contenedores:

- `web`: contiene la aplicación desarrollada en Python con Flask. Gunicorn se encarga de publicar la aplicación en el puerto 8000.
- `db`: contiene PostgreSQL 16 y almacena los metadatos de los documentos, como el nombre, la categoría, la descripción y la persona responsable.

La aplicación guarda los archivos subidos en un volumen llamado `uploads`. PostgreSQL utiliza otro volumen llamado `postgres_data`.

Elegí separar la aplicación, la base de datos y los archivos porque cada componente tiene una responsabilidad diferente. Además, los volúmenes permiten conservar la información aunque los contenedores se detengan o se vuelvan a crear.

## Conexión entre los componentes

```text
Usuario
   │
   │ http://localhost:8000
   ▼
Contenedor web
Python + Flask + Gunicorn
   │
   ├──────────────► Volumen uploads
   │                Archivos subidos
   │
   └── Puerto 5432 ──► Contenedor db
                       PostgreSQL
                            │
                            ▼
                       Volumen postgres_data
                       ```

El navegador solamente se conecta con el contenedor `web`. La base de datos no publica su puerto hacia Internet y sólo se comunica con la aplicación mediante la red interna creada por Docker Compose.

El diagrama gráfico se encuentra en:

```text
diagrams/arquitectura-local.png
```

## Cómo ejecutar la aplicación

Primero es necesario iniciar Docker Desktop. Después, desde una terminal ubicada en la carpeta `app`, se ejecuta:

```bash
docker compose up --build
```

Cuando los servicios están listos, la aplicación se abre desde:

```text
http://localhost:8000
```

También se puede comprobar el estado de la aplicación y la base de datos ingresando a:

```text
http://localhost:8000/health
```

Si todo funciona correctamente, devuelve una respuesta similar a:

```json
{
  "database": "ok",
  "status": "ok"
}
```

Para detener los contenedores se utiliza `Ctrl + C` o:

```bash
docker compose down
```

Los documentos y datos se mantienen porque están guardados en volúmenes.

Si se quisiera eliminar también toda la información local, se utilizaría:

```bash
docker compose down -v
```

Este último comando debe usarse con cuidado porque elimina los volúmenes y todos los datos almacenados.

## Decisiones tomadas

Utilicé PostgreSQL localmente para que el entorno se parezca a la arquitectura que propongo en AWS con Amazon RDS for PostgreSQL.

También agregué un healthcheck para comprobar que la aplicación puede comunicarse correctamente con la base de datos. Docker espera a que PostgreSQL esté saludable antes de iniciar CloudDesk.

La aplicación se ejecuta con un usuario sin privilegios dentro del contenedor y utiliza Gunicorn en lugar del servidor de desarrollo de Flask. Esto permite que el entorno local sea más parecido a una ejecución de producción.