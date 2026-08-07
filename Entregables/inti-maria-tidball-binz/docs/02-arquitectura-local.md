# 02. Arquitectura local y entorno de desarrollo

## Visión general

El entorno de desarrollo local de Gentle Task Companion utiliza contenedores administrados mediante Docker Compose. Toda la infraestructura necesaria para ejecutar la aplicación se encuentra en la carpeta `app/` del repositorio y se despliega con un solo comando, `docker compose up --build`.  Luego de ejecutar este comando, se puede acceder a la aplicación en [http://localhost:3000](http://localhost:3000).

Esta arquitectura local permite reproducir de forma aislada la pila completa de la aplicación, incluyendo la interfaz de usuario, la API REST, el proveedor de identidad, la base de datos NoSQL y el almacenamiento de objetos S3.

## Servicios del entorno local (Docker Compose)

El archivo `app/docker-compose.yml` define siete servicios que se comunican por la red interna que crea Docker Compose:

| Contenedor | Imagen / Origen | Puerto Host:Contenedor | Función y descripción |
|---|---|---|---|
| `frontend` | Next.js (build `./frontend`) | 3000:3000 | Interfaz gráfica y cliente PWA. Renderiza las vistas y gestiona el estado local. |
| `backend` | Hono Node/TS (build `./backend`) | 8080:8080 | API REST principal. Procesa la lógica de negocio y valida los tokens JWT en cada petición. |
| `scylla` | `scylladb/scylla:2026.2.2` | 8000:8000 | Base de datos NoSQL con interfaz Alternator compatible con la API de AWS DynamoDB. |
| `minio` | `minio/minio:RELEASE.2025-09-07` | 9000:9000 / 9001:9001 | Servidor de almacenamiento de objetos compatible con la API de AWS S3. El puerto 9001 expone la consola web. |
| `mock-oidc` | `ghcr.io/navikt/mock-oauth2-server:2.1.10` | 8081:8080 | Servidor OIDC de desarrollo para autenticación local mediante flujos Authorization Code con PKCE. |
| `create-table` | Hono Node/TS (build `./backend`) | Efímero (Sin puerto) | Job de inicio que crea la tabla `gentle` en ScyllaDB utilizando la API de DynamoDB antes de arrancar el backend. |
| `create-bucket` | `minio/mc:RELEASE.2025-08-13` | Efímero (Sin puerto) | Job de inicio que crea el bucket `gentle-media` en MinIO antes de arrancar el backend. |

## Volúmenes y estado

El `docker-compose.yml` no define volúmenes persistentes, y es a propósito. El backend es stateless: no guarda nada en disco. Todo el estado vive en la capa de datos, ScyllaDB (API DynamoDB) y MinIO (API S3). En desarrollo eso hace que los datos sean efímeros: al recrear los contenedores se pierden y se reconstruyen con los jobs `create-table` y `create-bucket`, lo que mantiene el entorno liviano y reproducible.

Es la misma idea que llevo a la nube, y acá lo importante es el costo. Se podría escalar a cero teniendo volúmenes igual (son cosas independientes), pero mantener almacenamiento persistente como EBS o EFS tiene un costo continuo: se paga esté o no en uso. Al dejar el estado en servicios gestionados y pay-per-use (DynamoDB y S3), evito ese costo fijo: el cómputo corre como Lambda (sin disco) y solo pago por lo que efectivamente se usa. Por eso, para que el costo sea lo más bajo posible, elegí no usar volúmenes.

## Diagrama de arquitectura local

El diagrama del stack local está en [`diagrams/arquitectura-local.png`](../diagrams/arquitectura-local.png). En texto:

```
[ Navegador Web / PWA ] 
          │
          ├─► HTTP GET/POST :3000 ──────────► [ frontend (Next.js PWA) ]
          │                                         │
          ├─► Login OIDC :8081 ─────────────► [ mock-oidc (OAuth2 Dev) ]
          │                                         ▲
          └─► API REST con Bearer JWT :8080 ────────┼──► [ backend (Hono API) ]
                                                    │           │
                                       Validación JWT           ├─► DynamoDB SDK :8000 ─► [ scylla (ScyllaDB) ]
                                       (JWKS /default/jwks)     │
                                                                └─► S3 SDK :9000 ───────► [ minio (Object Storage) ]

[ Jobs de arranque ]
  ├─► create-table  ──(Crea tabla 'gentle')──► [ scylla :8000 ]
  └─► create-bucket ──(Crea bucket 'gentle-media')──► [ minio :9000 ]
```

## Pasos del flujo de datos entre componentes

1. **Carga inicial:** El usuario ingresa a la aplicación accediendo a `http://localhost:3000` desde el navegador. El servidor Next.js entrega la PWA cliente.
2. **Autenticación:** Al presionar iniciar sesión, la PWA redirige al contenedor `mock-oidc` en el puerto 8081. El usuario completa el login interactivo y recibe un token JWT firmado.
3. **Petición a la API:** El cliente PWA realiza peticiones HTTP hacia el backend Hono en `http://localhost:8080` adjuntando el token JWT en el encabezado de autorización.
4. **Verificación de seguridad:** El backend consulta las llaves públicas expuestas en `http://mock-oidc:8080/default/jwks` para verificar la firma y vigencia del JWT sin compartir credenciales secretas.
5. **Persistencia NoSQL:** Si el token es válido, la API ejecuta operaciones de lectura o escritura en ScyllaDB mediante la API Alternator en el puerto 8000.
6. **Almacenamiento multimedia:** Para la gestión de archivos adjuntos o recursos estáticos, la API se conecta con el puerto 9000 del contenedor MinIO.

## Instrucciones de ejecución y diagnóstico

### Despliegue del entorno
Para construir las imágenes e iniciar la totalidad de los contenedores, ejecute los siguientes comandos en la terminal:

```bash
cd app/
docker compose up --build
```

### Verificación de servicios
Una vez finalizado el arranque, los puntos de acceso disponibles son:
- **Frontend PWA:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`
- **Proveedor OIDC local:** `http://localhost:8081`
- **Consola de administración MinIO:** `http://localhost:9001` (Usuario: `minioadmin`, Clave: `minioadmin`)

### Monitoreo y diagnóstico
Para revisar los registros del backend o comprobar el estado de los contenedores:

```bash
# Ver logs en tiempo real del backend
docker compose logs -f backend

# Inspeccionar el estado de salud de los servicios
docker compose ps
```

### Detención del entorno
Para detener los servicios y liberar los recursos del sistema:

```bash
docker compose down
```

## Segundo build: AWS emulado con MiniStack y OpenTofu

Además del stack self-host, la app tiene un segundo build que corre el **mismo código** contra AWS emulado: [MiniStack](https://ministack.org), un emulador local compatible con LocalStack que agrupa los servicios de AWS en un solo contenedor, aprovisionado con **OpenTofu**. Se levanta con `docker compose -f docker-compose.aws.yml up` y `tofu apply` desde `infra/aws/` (los pasos están en `infra/aws/README.md`).

No reemplaza al self-host: son dos builds en paralelo. El self-host usa ScyllaDB, MinIO y mock-oidc; el AWS-emulado usa DynamoDB, S3, Cognito, SQS, Lambda y API Gateway emulados. Lo único que cambia entre los dos es contra qué servicios apunta el backend, no su lógica, y esa dualidad es la prueba concreta de portabilidad frente al bloqueo de proveedor.

### Por qué

Los mismos archivos `.tf` describen la infraestructura para AWS real y para el emulador local, sin costo de nube, así que puedo validar la IaC (los planes de OpenTofu, las políticas de recursos) de forma reproducible antes de tocar una cuenta real. El backend Hono se empaqueta como Lambda con el adapter `hono/aws-lambda`: es el mismo `app` que en el self-host corre como contenedor, solo cambia el envoltorio.

### Estado

El build AWS-emulado corre de punta a punta: login por Cognito, API Gateway → Lambda → DynamoDB, S3 con URLs prefirmadas, y la cola SQS con su DLQ. Queda verificado con el script `infra/aws/smoke.sh`.



