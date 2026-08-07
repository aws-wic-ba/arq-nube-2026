# 06: Pensamiento arquitectónico y Disaster Recovery

## Disponibilidad y perfiles de uso

La aplicación Gentle Task Companion está destinada al apoyo de autocuidado para personas neurodivergentes. Los patrones de acceso son personales y distribuidos a lo largo del día, sin picos masivos de tráfico predecibles. Esto permite realizar actividades de mantenimiento programado en ventanas operativas con bajo impacto.

Sin embargo, las herramientas de contención emocional (botón de Crisis, ejercicios de respiración y tarjetas de comunicación) requieren una disponibilidad constante para respaldar al usuario en cualquier momento. Para garantizar que estas funciones sigan accesibles incluso durante fallas severas en el backend o en la base de datos, dichas vistas están diseñadas como recursos estáticos públicos servidos mediante la red CDN (CloudFront) y almacenados localmente por el Service Worker de la PWA.

## Evaluación de riesgos y principios de diseño

1. Protecciones de privacidad y datos sensibles: La aplicación registra información personal vinculada al estado de ánimo y notas de autocuidado. Se aplican los principios de minimización de datos, cifrado obligatorio en tránsito (TLS 1.3) y en reposo (AWS KMS), junto con el aislamiento de recursos por usuario mediante tokens JWT validados exclusivamente en el servidor.
2. Riesgos técnicos contemplados: Pérdida o corrupción de datos por error humano, fallas en zonas de disponibilidad de AWS, indisponibilidad temporal de proveedores de identidad OIDC o degradación de servicios externos de contenido multimedia.

## Objetivos de recuperación (RTO y RPO)

Para equilibrar la continuidad operativa con la eficiencia de costos en un proyecto personal, se definieron los siguientes parámetros de recuperación:

- RPO (Recovery Point Objective): 5 minutos. Ante un desastre catastrófico o corrupción de datos, el volumen máximo de información que se admite perder es de 5 minutos. Esto se logra mediante el respaldo continuo punto en el tiempo (PITR) en DynamoDB y el versionado automático de objetos en Amazon S3.
- RTO (Recovery Time Objective): 1 a 2 horas. En caso de una falla total que requiera reconstruir el entorno en una nueva región de AWS, el tiempo estimado para restaurar la infraestructura completa y levantar el servicio es de 1 a 2 horas. Esto se ejecuta mediante la reaplicación automatizada de los scripts de infraestructura como código con OpenTofu.

## Estrategia de Disaster Recovery: Backup & Restore

Se seleccionó la estrategia de Backup & Restore debido a que ofrece el balance óptimo entre costo operativo y tiempo de recuperación para este tipo de aplicación. Estrategias de alta disponibilidad continua multi-región (como Active-Passive Pilot Light o Active-Active Multi-Region) generarían costos fijos mensuales desproporcionados que no se justifican para la escala del proyecto.

### Mecanismos de respaldo y restauración

1. DynamoDB Point-in-Time Recovery (PITR): La tabla principal de la aplicación tiene activado PITR. AWS realiza respaldos continuos segundo a segundo con una ventana de retención de 35 días. Ante una corrupción accidental de datos o un fallo en la lógica de la aplicación, es posible restaurar la tabla a cualquier segundo específico dentro del período de retención, garantizando el RPO de 5 minutos.
2. Versionado y almacenamiento en Amazon S3: Los buckets de S3 dedicados a los archivos multimedia del usuario cuentan con versionado de objetos habilitado. Si un archivo es eliminado o sobrescrito por error, la versión previa permanece recuperable. Adicionalmente, las imágenes de la aplicación pueden volver a generarse a partir del almacenamiento local o de fuentes de origen.
3. Desacoplamiento de mensajes con Amazon SQS + DLQ: los mensajes de ingesta de favoritos encolados en Amazon SQS no se pierden ante una degradación del backend o del servicio externo. Los que fallan de forma consecutiva se mueven a la Dead Letter Queue (DLQ), donde quedan hasta 14 días para inspección y reprocesamiento una vez restaurado el servicio.

## Plan de contingencia ante fallas regionales

1. Redespliegue con OpenTofu (RTO 1 a 2 horas): Toda la arquitectura de AWS (API Gateway, funciones Lambda, tablas de DynamoDB, buckets de S3, colas SQS, claves KMS y configuraciones de Cognito) se encuentra definida de forma declarativa mediante código en archivos de OpenTofu. Ante la pérdida total de una región de AWS:
   - Se ejecuta el comando de despliegue de OpenTofu apuntando a una región secundaria (por ejemplo, de us-east-1 a us-west-2).
   - Se restaura la última copia de seguridad de DynamoDB vía PITR o respaldo bajo demanda en la nueva región.
   - Se actualizan los registros DNS en la CDN para redirigir el tráfico al nuevo API Gateway.
2. Portabilidad e infraestructura alternativa: el backend (Hono) usa interfaces estándar (SDK de DynamoDB, SDK de S3, OIDC), así que el mismo código corre en AWS, en el build AWS-emulado (MiniStack) y en self-host. Como resiliencia adicional frente al bloqueo de proveedor (vendor lock-in), ante una contingencia extrema el sistema puede migrarse a un entorno self-hosted: ScyllaDB para la API de DynamoDB, MinIO para la de S3 y Authentik para OIDC.
