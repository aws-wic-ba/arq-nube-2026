# 05 — Estimación de costos

## Servicios más costosos

| Servicio | Costo estimado/mes | Notas |
|----------|--------------------|-------|
| RDS PostgreSQL + PostGIS (`db.t4g.medium`, Multi-AZ) | ~$85 | El componente más caro (alta disponibilidad + PostGIS) |
| ECS Fargate (2 tareas de 0.5 vCPU, 1 GB RAM) | ~$20 | Cómputo serverless de la API FastAPI |
| NAT Gateway | ~$35 | Costo fijo mensual por procesamiento de tráfico saliente privado |
| Application Load Balancer (ALB) | ~$20 | Costo fijo por hora + métricas de LCU procesadas |
| Amazon S3 (Frontend, Comprobantes y Backups) | ~$5 | Almacenamiento estático de imágenes y recetas |
| CloudWatch Logs & Secrets Manager | ~$5 | Registros de auditoría y almacenamiento de credenciales |

**Total estimado:** ~$170/mes para producción con alta disponibilidad (Multi-AZ)

## Decisiones de optimización tomadas

- **Fargate Spot en staging:** Ahorro del ~70% en entornos de pruebas/desarrollo
- **Instancias ARM64 (`t4g`):** ~20% más baratas y con excelente rendimiento para consultas de PostGIS
- **S3 Lifecycle Policies:** Mueve backups históricos de RDS y comprobantes viejos a Glacier tras 30 días
- **CloudFront CDN:** Absorbe las lecturas del frontend estático a costo casi nulo ($0 en el Free Tier de AWS)

## Lo que evitaríamos en una primera versión

- **NAT Gateway en staging:** Usar subredes públicas con IPs públicas para los contenedores en entorno de prueba ahorra ~$35/mes
- **RDS Multi-AZ en ambientes bajos:** Usar instancias Single-AZ en entornos de desarrollo y pruebas reduce el costo de la base de datos a la mitad (~$40/mes), dejando la configuración Multi-AZ únicamente para el entorno de producción.
- **Reservations / Savings Plans:** No comprometerse a contratos de 1 a 3 años hasta entender el patrón de tráfico real de las campañas

## Herramienta recomendada

Usar la [AWS Pricing Calculator](https://calculator.aws/) para estimar costos detallados con el tráfico exacto de la arquitectura.