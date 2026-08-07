# 03. Arquitectura en AWS Cloud

La arquitectura propuesta para Gentle Task Companion evoluciona el stack local hacia servicios gestionados y serverless de AWS. El diseño se basa en dos principios fundamentales: pago por uso con capacidad de escalar a cero (evitando costos en periodos de inactividad) y portabilidad del código entre AWS y entornos locales.

## Servicios y justificación técnica

| Servicio AWS | Rol | Justificación de Selección |
|---|---|---|
| CloudFront + S3 | Hosting del Frontend PWA | CDN global con baja latencia, soporte HTTPS nativo y almacenamiento de archivos estáticos a bajo costo. |
| Cognito User Pools | Gestión de Identidad y Autenticación | Proveedor OIDC gestionado con soporte para registro de usuarias, gestión de sesiones, inicio seguro y autenticación multi-factor (MFA). |
| API Gateway (HTTP API) | Punto de Entrada de la API | Alternativa ligera a REST API con 70% menor costo y menor latencia; incluye autorizador JWT nativo para validar tokens OIDC en la frontera. |
| Lambda | Cómputo del backend (Hono) | Un solo Lambda con Hono que rutea toda la API ("Lambdalith"); autoescala por demanda y no genera costo sin solicitudes. Es el mismo `app` que en self-host corre como contenedor. |
| Amazon SQS + DLQ | Cola de mensajes asíncrona | Desacopla la ingesta de favoritos de animalitos (fetch a una API externa + guardado en S3/DynamoDB) de la request del usuario. La DLQ retiene los mensajes que fallan tras 3 reintentos. |
| DynamoDB | Base de Datos Principal | Base NoSQL completamente gestionada configurada con diseño de tabla única (Single-Table Design) y modo de capacidad On-Demand. |
| S3 (Bucket de Medios) | Almacenamiento de Archivos | Guarda audios de relajación e imágenes personalizadas; utiliza URLs prefirmadas para descargas y cargas directas desde la PWA. |
| AWS KMS | Cifrado en Reposo | Gestión de claves criptográficas para cifrar automáticamente los datos almacenados en DynamoDB y los buckets de S3. |
| Amazon CloudWatch | Observabilidad | Recolección centralizada de logs estructurados, métricas de rendimiento y alarmas de salud del sistema. |

## Integración y mecanismos de seguridad

1. Autenticación y Verificación de JWT:
   La usuaria se autentica contra Cognito User Pools. Al obtener el token JWT, las solicitudes HTTPS hacia API Gateway incluyen la cabecera `Authorization: Bearer <token>`. La validación criptográfica de la firma se hace en el middleware del backend Hono, que consulta las claves públicas (JWKS) de Cognito. Se valida ahí, y no en el autorizador nativo de API Gateway, para que el mismo código valide igual en el build self-host (portabilidad). La identidad y los permisos salen solo del token verificado.

2. Procesamiento Asíncrono con SQS y Dead Letter Queue (DLQ):
   Para no atar la latencia de la API a un servicio externo lento, la ingesta de favoritos de animalitos se hace de forma asíncrona. Cuando la usuaria guarda un animalito, el backend encola `{sub, especie, url}` en la cola `gentle-task-events` y responde enseguida (202); una Worker Lambda toma el mensaje, hace el fetch de la imagen a la API externa (cat/dog/capy) y la guarda en S3 con su metadata en DynamoDB. Si el fetch falla de forma persistente (URL rota, API caída), tras 3 reintentos el mensaje pasa a la DLQ `gentle-task-events-dlq`, donde queda para inspección y dispara una alarma en CloudWatch.

3. Transferencia Eficiente con URLs Prefirmadas en S3:
   La carga o descarga de archivos pesados (como clips de audio o imágenes de apoyo) no transita por API Gateway ni Lambda. El backend Hono genera una URL prefirmada con un tiempo de expiración corto (ej. 15 minutos). La PWA utiliza esa URL para subir o descargar el archivo directamente desde S3, reduciendo la latencia y los costos de cómputo.

## Portabilidad y prevención de bloqueo de proveedor (Anti-Lock-in)

La aplicación utiliza interfaces estándar para garantizar que el código pueda ejecutarse tanto en AWS como en un entorno local o self-hosted sin modificar la lógica de negocio:

| Rol Arquitectónico | Implementación Cloud (AWS) | Implementación local (OpenTofu + Ministack - Integrado) | Interfaz Común |
|---|---|---|---|
| Base de Datos | Amazon DynamoDB | ScyllaDB (modo Alternator) / Ministack DynamoDB | API NoSQL DynamoDB v2 |
| Almacenamiento de Objetos | Amazon S3 | MinIO / Ministack S3 | API S3 (AWS SDK v3) |
| Autenticación | Amazon Cognito | mock-oidc / Ministack Cognito | Estándar OpenID Connect (OIDC) |
| Cómputo Backend | AWS Lambda / ECS Fargate | Contenedor Docker Node.js (Hono) | HTTP App (Request/Response web standards) |

El build AWS-emulado usa OpenTofu + MiniStack para emular los servicios de AWS (Cognito, DynamoDB, S3, SQS, Lambda, API Gateway) bajo el mismo estándar declarativo de IaC y sin costo, en paralelo al self-host. Corre de punta a punta (verificado con `infra/aws/smoke.sh`).

---

## Control de acceso IAM y gestión de identidades con Cognito

La seguridad y la gestión de accesos en la nube de AWS se estructuran bajo dos pilares: el **Principio de Mínimo Privilegio mediante Roles IAM** y la **Autenticación/Autorización segregada con Amazon Cognito**.

### 1. Principio de Mínimo Privilegio e IAM Roles

El sistema prohíbe el uso de credenciales de usuario root o permisos globales (`AdministratorAccess`). Cada componente de cómputo y perfil operativo cuenta con un IAM Role dedicado cuyos permisos están estrictamente limitados al recurso y acción necesarios.

#### A. Rol de ejecución del backend (`GentleBackendExecutionRole`)
Es el rol asumido por los contenedores/funciones Lambda de la API backend Hono y los Workers asíncronos.
- **DynamoDB (Tabla `gentle`):** Permisos `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem` y `dynamodb:Query`, acotados exclusivamente al recurso `arn:aws:dynamodb:us-east-1:123456789012:table/gentle`.
- **Almacenamiento S3 (Bucket de medios):** Permisos `s3:GetObject` y `s3:PutObject` acotados al prefijo de recursos multimedia `arn:aws:s3:::gentle-media/*`.
- **Cola de mensajes SQS:** Permiso `sqs:SendMessage` restringido a la cola principal `arn:aws:sqs:us-east-1:123456789012:gentle-task-events-queue`.
- **Cifrado KMS:** Permisos `kms:Decrypt` y `kms:GenerateDataKey` acotados a la clave KMS del proyecto.

#### B. Rol de mantenimiento operativo acotado (`GentleOpsMaintenanceRole`)
Es un rol de administración acotada asignado al personal de ingeniería de operaciones para tareas de diagnóstico e inspección. **No otorga acceso de administrador del sistema ni capacidad de modificar o eliminar datos de usuarias.**
- **Monitoreo y métricas:** Permisos `cloudwatch:GetMetricData`, `logs:DescribeLogGroups`, `logs:DescribeLogStreams` y `logs:FilterLogEvents` para auditar el comportamiento del sistema y resolver incidentes.
- **Inspección de DLQ (Dead Letter Queue):** Permisos `sqs:ReceiveMessage`, `sqs:GetQueueAttributes` y `sqs:DeleteMessage` restringidos a `arn:aws:sqs:us-east-1:123456789012:gentle-task-events-dlq` para inspeccionar y reprocesar mensajes fallidos tras la activación de alarmas.

---

### 2. Diferenciación entre Cognito User Pools y Cognito Identity Pools

La arquitectura distingue claramente la responsabilidad entre la autenticación de la usuaria y la autorización sobre recursos AWS:

| Dimensión | Cognito User Pools (CUP) | Cognito Identity Pools (CIP) |
|---|---|---|
| **Propósito principal** | Autenticación, directorio de usuarias y gestión de credenciales de aplicación. | Autorización federada y entrega de credenciales temporales AWS IAM. |
| **Artefacto emitido** | Tokens JWT de estándares OIDC (ID Token, Access Token, Refresh Token). | Credenciales temporales de AWS IAM (Access Key, Secret Key, Session Token via STS). |
| **Mapeo de funcionalidad** | Registro de usuarias, inicio de sesión, recuperación de contraseña, verificación por email y MFA. | Permite a la PWA o clientes externos interactuar directamente con S3 o DynamoDB bajo políticas IAM. |
| **Uso en Gentle Task Companion** | La PWA autentica a la usuaria contra CUP. El backend Hono valida la firma de los JWT para autorizar las rutas protegidas. | **No se usa.** Se evaluó y se descartó: en lugar de darle credenciales IAM al navegador, el acceso a S3 va por URLs prefirmadas que emite el backend tras validar el JWT, así el cliente nunca tiene credenciales AWS. |

---

## Diagrama de arquitectura

El diagrama de la arquitectura AWS está en [`diagrams/arquitectura-aws.png`](../diagrams/arquitectura-aws.png).

