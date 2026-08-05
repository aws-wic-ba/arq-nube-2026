## 05 — Estimación de Componentes y Costos

ECS Fargate (Cómputo): 
Rol: Ejecución de tareas FastAPI. — 
Por qué: Se paga únicamente por los recursos de CPU y Memoria (vCPU/GB por segundo) consumidos por el contenedor en ejecución, sin costos por servidores ociosos.

Amazon EFS (Almacenamiento persistente): 
Rol: Alojamiento del archivo SQLite (database.db).
Por qué: Se cobra por gigabyte almacenado mensualmente. Es esencial para evitar la pérdida de datos ante reinicios de tareas.  

Application Load Balancer (ALB): 
Rol: Distribución de tráfico.
Por qué: Costo fijo por hora de uso más cargos por la cantidad de datos procesados (LCUs).

Route 53: 
Rol: Gestión DNS.
Por qué: Costo mínimo por zona alojada más peticiones DNS gestionadas.

CloudFront:
Rol: Red de distribución de contenido (CDN).
Por qué: El costo varía en función del volumen de transferencia de datos de salida (Data Transfer Out) hacia internet y las solicitudes HTTP/HTTPS.

ACM (AWS Certificate Manager): 
Rol: Certificados TLS/SSL. 
Por qué: Su costo es gratuito, ya que los certificados públicos emitidos por ACM no tienen cargo adicional.

Secrets Manager:
Rol: Protección de credenciales.
Por qué: Costo bajo por cada secreto almacenado mensualmente y por cada llamada a la API de recuperación.

CloudWatch:
Rol: Logs y métricas.
Por qué: Costo basado en el volumen de datos de logs ingeridos y almacenados, además de las alarmas configuradas.

Amazon S3: 
Rol: Almacenamiento de backups.
Por qué: Costo marginal por gigabyte almacenado en la región para los respaldos periódicos del archivo de base de datos.

## Estrategias de Optimización de Costos

Uso de Fargate Spot: Para entornos de desarrollo, pruebas o tareas no críticas, se puede utilizar ECS Fargate Spot reduciendo significativamente el costo de cómputo (hasta un 70% de descuento).

Políticas de Ciclo de Vida (Lifecycle Policies) en S3: Configurar reglas para mover los respaldos antiguos de SQLite hacia clases de almacenamiento más económicas (como S3 Standard-IA o Glacier) a medida que pasa el tiempo.

Dimensionamiento (Right Sizing): Asignar los recursos mínimos necesarios de vCPU y Memoria a las tareas de Fargate para evitar el sobreaprovisionamiento inicial.

## Herramienta recomendada

Usar la [AWS Pricing Calculator](https://calculator.aws/) para estimar costos con los valores reales de su arquitectura.
