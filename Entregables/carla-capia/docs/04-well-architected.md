# 04 — AWS Well-Architected Framework

La arquitectura de PeluApp se evalúa tomando como referencia los seis pilares del AWS Well-Architected Framework.

## Excelencia operativa

**Decisión:** utilizar ECS Fargate para ejecutar la aplicación, ECR para administrar las imágenes Docker y CloudWatch para centralizar logs y métricas.

**Qué mejoraría:** implementar CI/CD para automatizar pruebas y despliegues.

## Seguridad

**Decisión:** utilizar subredes privadas para ECS y RDS, Security Groups para controlar el tráfico, IAM para gestionar permisos y Secrets Manager para proteger las credenciales de la base de datos. CloudFront permite utilizar HTTPS.

**Qué mejoraría:** incorporar MFA y CloudTrail para una auditoría más completa.

## Fiabilidad

**Decisión:** ejecutar ECS en dos Availability Zones y utilizar ALB para distribuir las solicitudes. RDS Multi-AZ y los backups automáticos permiten mejorar la disponibilidad y recuperación de la base de datos.

**Qué mejoraría:** realizar periódicamente pruebas de restauración y recuperación.

## Eficiencia de rendimiento

**Decisión:** CloudFront mejora la entrega del contenido, mientras que ALB distribuye las solicitudes entre las tareas ECS. Fargate permite ajustar los recursos según la demanda.

**Qué mejoraría:** analizar métricas reales de uso y tiempos de respuesta para ajustar CPU, memoria y cantidad de tareas.

## Optimización de costos

**Decisión:** utilizar Fargate evita administrar servidores y permite dimensionar los recursos según las necesidades de PeluApp. También se puede controlar la retención de logs de CloudWatch.

**Qué mejoraría:** utilizar AWS Budgets y revisar periódicamente recursos sobredimensionados o sin uso.

## Sostenibilidad

**Decisión:** utilizar servicios administrados y recursos ajustados a la demanda evita mantener infraestructura innecesaria. Las imágenes Docker pueden mantenerse optimizadas.

**Qué mejoraría:** revisar periódicamente el consumo de CPU, memoria y almacenamiento para reducir recursos ociosos.