# 04 — AWS Well-Architected Framework

## Excelencia Operativa

**Decisiones tomadas:**
- Logs centralizados de la API FastAPI en CloudWatch Logs con retención de 30 días (`awslogs`)
- Alarmas en CloudWatch si el error rate supera el 5% o hay picos de latencia en peticiones
- Deploys automáticos vía GitHub Actions actualizando la task definition y la imagen en Amazon ECR y ECS Fargate

**Qué mejoraríamos:** Dashboards en Grafana para métricas de campañas activas, runbooks documentados para incidentes frecuentes y alertas automáticas por Slack/Telegram ante caídas de la API.

---

## Seguridad

**Decisiones tomadas:**
- Credenciales de la base de datos en Secrets Manager (nunca en el código ni en variables de entorno en texto plano)
- Contenedores de Fargate con IAM roles de mínimo privilegio (solo acceso a S3 de comprobantes y Secrets Manager)
- RDS PostgreSQL en subnet privada aislada, sin acceso ni IP pública desde internet
- HTTPS obligatorio en la CDN (CloudFront) y ALB con certificados gratuitos de AWS Certificate Manager (ACM)

**Qué mejoraríamos:** Agregar AWS WAF frente a CloudFront para mitigar ataques DDoS/botnets en campañas virales y sanitizar subidas de comprobantes en S3 con análisis antivirus automatizado.

---

## Fiabilidad

**Decisiones tomadas:**
- RDS PostgreSQL con Multi-AZ habilitado para failover automático en < 60s ante la caída de una AZ
- ECS Fargate con Auto Scaling (mínimo 2 tareas distribuidas en 2 AZs) basado en uso de CPU y memoria
- ALB con health checks hacia `/api/health` para remover tareas no saludables del pool de balanceo

**Qué mejoraríamos:** Implementar *Read Replicas* en RDS para derivar lecturas masivas de campañas y agregar pruebas de caos periódicas (AWS Fault Injection Simulator).

---

## Eficiencia de Rendimiento

**Decisiones tomadas:**
- Fargate para escalar tareas de cómputo serverless sin overhead de gestión de servidores EC2
- RDS PostgreSQL en instancias `t4g.medium` (Graviton2/arm64) optimizadas para procesamiento relacional y espacial (PostGIS)
- CloudFront para cachear el frontend estático y S3 para servir imágenes de comprobantes sin saturar el backend

**Qué mejoraríamos:** Agregar ElastiCache (Redis) para cachear los resultados de las consultas de cercanía geográfica (`ST_DWithin`) y reducir lecturas a la base de datos en picos de tráfico por difusión en redes.

---

## Optimización de Costos

**Decisiones tomadas:**
- Fargate Spot para entornos de prueba/staging (~70% de ahorro frente a On-Demand)
- Instancias `t4g` (arm64) ~20% más económicas que sus equivalentes en arquitectura x86
- S3 Lifecycle Policies para mover respaldos viejos de RDS y comprobantes históricos a Glacier después de 30 días
- CloudFront absorbe el tráfico estático, reduciendo las peticiones que llegan a las tareas de Fargate

**Qué mejoraríamos:** Evaluar el reemplazo del NAT Gateway por *VPC Endpoints* para S3/ECR para eliminar costos por transferencia de datos de salida.

---

## Sostenibilidad

**Decisiones tomadas:**
- Selección de la región `us-east-1` por su alta eficiencia energética e infraestructura de carbono neutral de AWS
- Fargate elimina instancias EC2 ociosas: el cómputo asignado se ajusta estrictamente al consumo de la API
- Auto Scaling reduce la capacidad del backend al mínimo durante horarios nocturnos sin campañas activas

**Qué mejoraríamos:** Activar el AWS Customer Carbon Footprint Tool para medir y reportar la huella de carbono de la infraestructura e implementar compresión agresiva de imágenes en los comprobantes.
