# 04. Well-Architected Framework

El diseño de la infraestructura y backend de Gentle Task Companion se alinea con los 6 pilares del marco AWS Well-Architected Framework. Para cada pilar se presentan las decisiones de arquitectura adoptadas en la implementación y las oportunidades de mejora identificadas para evoluciones futuras.

## 1. Seguridad (Security)

### Decisiones de arquitectura aplicadas
- **Autenticación e Identidad Gestionada:** Se usa Amazon Cognito User Pools en la nube, y su emulación con MiniStack en el build AWS-emulado local (verificado end-to-end: login por Hosted UI, JWT válido, RBAC por `cognito:groups`). Ambas operan bajo OIDC, con inicio de sesión seguro, gestión de sesiones y MFA opcional, sin escribir código propio de manejo de credenciales ni hash de contraseñas.
- **Verificación Estricta de Firma JWT en Hono:** La API HTTP en API Gateway valida la presencia del token. Adicionalmente, el middleware del backend Hono verifica la firma criptográfica del JWT utilizando las claves públicas (JWKS) del proveedor de identidad. La identidad de la usuaria se deriva exclusivamente de los claims del token verificado y jamás de datos no validados del cliente, previniendo vulnerabilidades de acceso cruzado entre usuarias.
- **Cifrado en Reposo y en Tránsito:** Cifrado de datos en reposo obligatorio en DynamoDB y S3 mediante AWS KMS (Customer Managed Keys). Cifrado en tránsito forzado en todas las conexiones a través de TLS 1.3/HTTPS mediante certificados gestionados en CloudFront y API Gateway.
- **Principio de Mínimo Privilegio y Separación de Roles IAM:** Se implementa un modelo estricto de control de acceso granular dividiendo las responsabilidades operativas en dos roles de IAM diferenciados:
  - *Rol de Ejecución Estándar (GentleBackendExecutionRole):* Asignado al entorno de ejecución serverless de la función Lambda backend y Workers. Contiene políticas con permisos mínimos indispensables acotados a acciones específicas (`dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:Query`, `sqs:SendMessage`, `s3:GetObject`, `s3:PutObject`). Cada acción está restringida explícitamente a las ARNs de los recursos del proyecto (`arn:aws:dynamodb:us-east-1:123456789012:table/gentle`, `arn:aws:sqs:us-east-1:123456789012:gentle-task-events-queue`, `arn:aws:s3:::gentle-media/*`). Se prohíben estrictamente políticas comodín (`*`) o roles genéricos de administración.
  - *Rol Administrador de Mantenimiento Acotado (GentleOpsMaintenanceRole):* Rol separado y acotado diseñado exclusivamente para tareas operativas y diagnósticos de mantenimiento. Otorga permisos específicos para la inspección de métricas y registros en CloudWatch Logs (`logs:FilterLogEvents`, `logs:DescribeLogGroups`, `cloudwatch:GetMetricData`), así como la inspección y reprocesamiento controlado de mensajes retenidos en la Dead Letter Queue de SQS (`sqs:ReceiveMessage`, `sqs:GetQueueAttributes`, `sqs:DeleteMessage`). Este rol no posee permisos de administración total de la cuenta (`AdministratorAccess`), previniendo la elevación no autorizada de privilegios.
- **Arquitectura de Identidad: Cognito User Pools vs. Identity Pools:**
  - *Cognito User Pools (CUP):* Utilizado como el directorio principal de usuarias y proveedor de identidad (IdP). Se encarga del registro, autenticación, gestión de sesiones, políticas de contraseñas y emisión de tokens JWT (ID Token y Access Token) basados en el estándar OIDC. El backend en Hono valida criptográficamente estos tokens mediante el conjunto de claves públicas (JWKS).
  - *Cognito Identity Pools (CIP):* Servicio orientado a proveer credenciales temporales de IAM para acceso directo de clientes a recursos de AWS (como S3 o DynamoDB).
  - *Decisión de Arquitectura:* Gentle Task Companion utiliza **exclusivamente Cognito User Pools**. En lugar de federar credenciales de IAM hacia la PWA mediante Identity Pools (lo cual requeriría incluir el SDK de AWS en el cliente y exponer políticas de IAM en dispositivos móviles), el acceso a archivos en S3 se gestiona mediante **URLs prefirmadas** emitidas por la API backend tras validar el JWT de User Pools. Esto elimina la necesidad de credenciales AWS en el cliente, reduce el tamaño del paquete JavaScript de la PWA y centraliza las reglas de autorización en la capa de negocio.
- **Aislamiento en Dispositivos Compartidos:** Limpieza explícita del estado local en el navegador PWA al cerrar sesión para evitar la exposición de datos personales de salud mental.

### Oportunidades de mejora futura
- Integración de AWS WAF en la capa de API Gateway para protección contra ataques web comunes (SQLi, XSS, rate limiting por IP).
- Habilitación de AWS GuardDuty para detección de anomalías y amenazas de seguridad en la cuenta cloud.

## 2. Excelencia operativa (Operational Excellence)

### Decisiones de arquitectura aplicadas
- **Infraestructura como Código (IaC):** Definición declarativa con OpenTofu, con versiones de proveedores fijadas y usando módulos del registry donde conviene. Los mismos archivos `.tf` aprovisionan tanto el build AWS-emulado sobre MiniStack como la infraestructura cloud en AWS.
- **Pruebas Automatizadas:** Cobertura de backend con una suite de 74 pruebas automatizadas (unidad e integración) que verifican controladores, middlewares y las integraciones con DynamoDB y S3, ejecutadas de forma aislada.
- **Observabilidad y Registro Centralizado:** Ingesta de métricas y registros estructurados (JSON) en Amazon CloudWatch Logs desde API Gateway, funciones Lambda y SQS.

### Oportunidades de mejora futura
- Automatización del flujo de integración y despliegue continuo (CI/CD) mediante GitHub Actions.
- Implementación de rastreo distribuido con AWS X-Ray para auditar la latencia detallada entre API Gateway, Hono, SQS y DynamoDB.

## 3. Confiabilidad (Reliability)

### Decisiones de arquitectura aplicadas
- **Alta Disponibilidad Multi-AZ:** Despliegue en servicios gestionados serverless (DynamoDB, S3, Cognito, API Gateway) distribuidos automáticamente en múltiples zonas de disponibilidad (Multi-AZ) dentro de la región AWS.
- **Desacople Asíncrono y Resiliencia con SQS + DLQ:** La ingesta de favoritos de animalitos (fetch a una API externa + guardado en S3/DynamoDB) se procesa de forma asíncrona con Amazon SQS, así un fallo del servicio externo no rompe la request del usuario. Si un mensaje falla tras 3 reintentos consecutivos, se redirige a una Dead Letter Queue (DLQ), evitando la pérdida de información y disparando alarmas operativas.
- **Recuperación de Datos (RPO 5 min):** Habilitación de Point-in-Time Recovery (PITR) en DynamoDB para restauración de datos a cualquier segundo dentro de los últimos 35 días, complementado con versionado de objetos en buckets de S3.
- **Degradación Amable:** La PWA permite el acceso en modo offline a las herramientas estáticas de autorregulación emocional (ejercicios de respiración y sonidos preguardados) aun cuando no exista conectividad con el backend.
- **Contención de picos y abuso:** El throttling en API Gateway (límites de rate y burst) y la reserved concurrency en Lambda ponen un techo a la carga que llega al backend, de modo que un pico o un flood no tumbe el servicio ni dispare el costo. CloudFront suma AWS Shield Standard para la protección DDoS básica de red, sin costo.

### Oportunidades de mejora futura
- Realización de pruebas automatizadas de caos (Chaos Engineering) para simular caídas de red y verificar la recuperación automática del sistema.

## 4. Eficiencia de rendimiento (Performance Efficiency)

### Decisiones de arquitectura aplicadas
- **Red de Distribución de Contenido (CDN):** Entrega global del frontend estático a través de Amazon CloudFront, reduciendo la latencia de carga inicial en dispositivos móviles.
- **Diseño NoSQL Optimizado (Single-Table Design):** En DynamoDB, el modelo de datos agrupa patrones de acceso frecuentes en una sola tabla. El dashboard inicial de la usuaria se recupera en una única consulta de baja latencia (Single Round-Trip), evitando joins o consultas múltiples.
- **Descarga Directa mediante URLs Prefirmadas:** La subida y descarga de archivos de audio e imágenes se realiza directamente entre la PWA y Amazon S3 mediante URLs prefirmadas emitidas por Hono, evitando sobrecargas de cómputo en la API.

### Oportunidades de mejora futura
- Configuración de reglas de almacenamiento en caché en la CDN para respuestas de lecturas estáticas de recursos de soporte.

## 5. Optimización de costos (Cost Optimization)

### Decisiones de arquitectura aplicadas
- **Modelo Serverless con Escalado a Cero:** Utilización exclusiva de componentes serverless (API Gateway, Lambda, DynamoDB On-Demand, S3) que no generan costos cuando no hay usuarias activas en la plataforma.
- **Elección de API Gateway HTTP API:** Reducción del costo de gestión de la API en aproximadamente un 70% comparado con la opción REST API, manteniendo un rendimiento superior.
- **Ahorro de Cómputo con URLs Prefirmadas:** Descarga del procesamiento de archivos binarios hacia S3, evitando pagar tiempo de ejecución de Lambda y transferencia de API Gateway.
- **Costo Cero en Desarrollo Local:** MiniStack + OpenTofu emulan localmente los servicios de AWS (Cognito, DynamoDB, S3, SQS, Lambda, API Gateway), eliminando los costos de nube durante el desarrollo y las pruebas.

### Oportunidades de mejora futura
- Afinar las políticas de ciclo de vida de S3 (ya hay versioning, transición a Standard-IA de medios poco consultados y expiración de versiones viejas) sumando S3 Intelligent-Tiering para media de acceso variable. Se evita Glacier para la media activa porque necesita reproducción instantánea.

## 6. Sostenibilidad (Sustainability)

### Decisiones de arquitectura aplicadas
- **Eliminación de recursos ociosos:** con el escalado a cero, la infraestructura no mantiene servidores encendidos ni recursos asignados sin uso, lo que reduce el consumo de energía.
- **Cómputo Basado en Eventos:** El uso de Lambda y SQS asegura que los ciclos de CPU y memoria se utilicen estrictamente durante la duración del procesamiento de cada evento.

### Oportunidades de mejora futura
- Optimización de los paquetes de código JavaScript/TypeScript y compresión de activos estáticos para minimizar el volumen de datos transmitidos por la red y reducir el consumo de batería en los dispositivos móviles de las usuarias.

