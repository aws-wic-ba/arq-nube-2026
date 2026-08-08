# 04 — Evaluación AWS Well-Architected

## Excelencia operativa
Despliegues repetibles desde una imagen ECR, healthcheck `/health`, logs centralizados y cambios normativos versionados. Mejora: CI/CD con aprobación antes de producción.

## Seguridad
Cognito con mínimo privilegio, RDS y tareas en subred privada, TLS, WAF, secretos gestionados y cifrado KMS. Mejora: MFA obligatorio para editores y registro de eventos con CloudTrail.

## Fiabilidad
ECS en dos AZ, ALB, RDS Multi-AZ, backups y S3 Versioning. La pérdida de una tarea o AZ no debe detener el servicio. Mejora: simulacro semestral de restauración.

## Eficiencia de rendimiento
Fargate permite ajustar CPU y memoria y escalar por utilización; CloudFront descarga trabajo estático. Mejora: medir tiempos de exportación y consultas antes de ampliar recursos.

## Optimización de costos
Comenzar con tareas pequeñas, autoscaling, retención limitada de logs, lifecycle de S3 y presupuestos. Desarrollo puede usar una sola tarea y RDS Single-AZ; producción conserva Multi-AZ.

## Sostenibilidad
Contenedores slim, escalado según demanda y lifecycle de objetos reducen capacidad ociosa. Revisar trimestralmente métricas y eliminar imágenes, logs y snapshots innecesarios.
