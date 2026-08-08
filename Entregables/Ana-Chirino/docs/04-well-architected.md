04 — AWS Well-Architected Framework

##Excelencia Operativa

Decisiones tomadas:

Logs centralizados de ejecuciones de AWS Lambda en CloudWatch Logs con retención configurada a 30 días.

Alarmas de CloudWatch configuradas para notificar cuando la tasa de errores en las Lambdas o API Gateway supere el 5%.

Despliegues automatizados de infraestructura e código usando AWS SAM / Serverless Framework mediante pipelines en GitHub Actions.

Qué mejoraríamos: tableros centralizados en Grafana/CloudWatch Dashboards, alertas automáticas integradas con Slack o Telegram para el equipo operativo, y runbooks de respuesta a incidentes.

##Seguridad

Decisiones tomadas:

Autenticación gestionada con Amazon Cognito emitiendo tokens JWT validados directamente en API Gateway.

Aplicación del principio de menor privilegio en los IAM Roles de cada función Lambda (permisos estrictos de lectura/escritura únicamente sobre la tabla InventarioApp).

Datos cifrados en reposo en DynamoDB usando claves gestionadas (AWS KMS) y datos cifrados en tránsito obligatorios vía HTTPS mediante CloudFront y API Gateway.

Qué mejoraríamos: implementar AWS WAF frente a CloudFront/API Gateway para prevenir ataques de denegación de servicio (DDoS) e inyecciones de código, y habilitar AWS GuardDuty para detección continua de amenazas.

##Fiabilidad

Decisiones tomadas:

Arquitectura 100% Serverless multizona (Multi-AZ de forma nativa en Lambda, API Gateway y DynamoDB) sin un punto único de falla.

Operaciones de ventas y stock procesadas en DynamoDB mediante TransactWriteItems, asegurando consistencia atómica y evitando inconsistencias en los inventarios.

Reintentos automáticos configurados en API Gateway y manejo de dead-letter queues (DLQ) en SNS/Lambda ante fallas de procesamiento.

Qué mejoraríamos: habilitar DynamoDB Global Tables si se requiere presencia internacional en múltiples regiones con réplica activa, y realizar pruebas periódicas de recuperación e inyección de fallas.

##Eficiencia de Rendimiento

Decisiones tomadas:

Adopción de un esquema Single-Table Design en DynamoDB para resolver consultas de productos y ventas en tiempos de respuesta de milisegundos de un solo dígito.

Carga de archivos estáticos del frontend optimizada mediante caché global en el edge con Amazon CloudFront.

Asignación ajustada de memoria y potencia de cómputo en AWS Lambda para maximizar la velocidad de ejecución.

Qué mejoraríamos: habilitar DynamoDB Accelerator (DAX) o una capa de caché en memoria si las consultas al catálogo de productos aumentan exponencialmente en horarios pico.

##Optimización de Costos

Decisiones tomadas:

Modelo de pago por uso puro (Serverless): costo $0 en reposo cuando el comercio no está registrando ventas o consultando el stock.

Capa gratuita de AWS (Free Tier) aprovechada al máximo con DynamoDB (25 GB gratis) y AWS Lambda (1 millón de solicitudes gratuitas al mes).

Reducción del tráfico hacia los servicios backend gracias al almacenamiento en caché de la interfaz en CloudFront.

Qué mejoraríamos: configurar reglas de ciclo de vida en S3 para exportar respaldos históricos de ventas a clases de almacenamiento Glacier y establecer presupuestos con AWS Budgets para evitar sobrecostos por picos inusuales de uso.

##Sostenibilidad
Decisiones tomadas:

Elección de una arquitectura Serverless que elimina la existencia de servidores EC2 u orquestadores ociosos consumiendo energía en momentos sin tráfico.

Selección de la región us-east-1, la cual cuenta con una alta proporción de suministro de energías renovables dentro de la infraestructura global de AWS.

Qué mejoraríamos: activar el uso de la herramienta AWS Customer Carbon Footprint Tool para medir y reportar progresivamente el consumo y la huella de carbono generada por la aplicación.
