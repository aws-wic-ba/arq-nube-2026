# 05 — Estimación de costos

## Supuesto académico

Ambiente productivo pequeño en `us-east-1`: dos tareas Fargate de 0,25 vCPU/0,5 GB, RDS PostgreSQL pequeño Multi-AZ, ALB, poco almacenamiento S3 y tráfico moderado.

| Componente | Estimación mensual orientativa (USD) |
|---|---:|
| ECS Fargate (2 tareas pequeñas) | 18–25 |
| RDS PostgreSQL Multi-AZ | 55–90 |
| Application Load Balancer | 18–25 |
| S3, ECR y backups | 3–10 |
| CloudWatch, Route 53, WAF y transferencia | 12–35 |
| **Total orientativo** | **106–185** |

No es una cotización. Fargate factura CPU, memoria y almacenamiento consumidos; RDS depende de región, tipo, almacenamiento y modalidad; S3 depende de capacidad, solicitudes, recuperación y transferencia. Antes de desplegar se debe actualizar el cálculo en AWS Pricing Calculator.

Fuentes oficiales consultadas el 6 de agosto de 2026: [AWS Fargate Pricing](https://aws.amazon.com/fargate/pricing/), [RDS for PostgreSQL Pricing](https://aws.amazon.com/rds/postgresql/pricing/) y [Amazon S3 Pricing](https://aws.amazon.com/s3/pricing/).
