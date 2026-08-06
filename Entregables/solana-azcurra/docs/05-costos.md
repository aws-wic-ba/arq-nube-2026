# 05 — Estimación de costos

Estimación mensual para el MVP (un municipio, poco tráfico), región us-east-1, precios aproximados del AWS Pricing Calculator.

## Servicios más costosos

| Servicio | Costo estimado/mes | Notas |
|----------|--------------------|-------|
| ALB | ~$18 | Costo fijo aunque haya poco tráfico — es el componente más caro del MVP |
| RDS PostgreSQL (db.t4g.micro, single-AZ, 20 GB) | ~$14 | La base de datos más chica alcanza para arrancar |
| ECS Fargate (1 tarea, 0.25 vCPU, 0.5 GB, 24/7) | ~$9 | Una sola tarea corriendo todo el mes |
| CloudWatch Logs | ~$3 | Depende del volumen de logs |
| Route 53 + Secrets Manager + ECR | ~$2 | Costos menores (zona DNS, 1 secreto, imágenes) |

**Total estimado:** ~$46/mes para el MVP

## Decisiones de optimización tomadas

- **Fargate en vez de App Runner:** ~50-60% menos por hora de cómputo para una app que corre 24/7
- **Instancias arm64 (t4g) en RDS:** más baratas que sus equivalentes x86 con igual o mejor performance
- **Sin NAT Gateway:** las tareas de Fargate van en subnet pública con IP propia (la base sigue en subnet privada); un NAT Gateway sumaría ~$35/mes, casi duplicando el costo total
- **Una sola tarea chica de Fargate:** se escala recién cuando el tráfico lo pida

## Lo que evité en esta primera versión

- **Multi-AZ en RDS:** duplicaría el costo de la base; queda como primera mejora al crecer
- **CloudFront (CDN):** los usuarios están todos en el mismo país y la app no sirve contenido estático pesado
- **Entorno de staging:** para un MVP alcanza con probar localmente con Docker antes de desplegar

## Herramienta utilizada

[AWS Pricing Calculator](https://calculator.aws/) para estimar los costos con los valores reales de la arquitectura.
