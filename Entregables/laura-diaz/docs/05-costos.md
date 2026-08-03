# 05 — Estimación de costos

## Servicios más costosos

| #   | Servicio                      | Configuración (según tu arquitectura)                                             | Costo mensual estimado (USD) |
| --- | ----------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| 1   | **ECS Fargate**               | 2 tareas, 0.5 vCPU / 1 GB, ARM, Linux, corriendo 24/7 (730 hs)                    | **~$28.84**                  |
| 2   | **RDS PostgreSQL**            | Multi-AZ, db.t4g.micro, PostgreSQL 16, 20 GB gp3                                  | **~$27**                     |
| 3   | **ALB**                       | tráfico bajo (~1 LCU promedio)                                                    | **~$22.27**                  |
| 4   | **VPC Endpoints (Interface)** | 4 endpoints (ecr x 2, logs, secretsmanager) × 2 AZ, 730 hs c/u + ~5 GB procesados | **~$58**                     |
|     | **Total estimado**            |                                                                                   | **~$137/mes**                |

## Decisiones de optimización tomadas

- **Fargate en ARM (Graviton):** Graviton es más barato comparado con x86.
- **RDS en t4g (Graviton) en vez de t3:** mismo ahorro relativo de arquitectura ARM aplicado a la base de datos.
- **VPC Endpoints en vez de NAT Gateway:** más barato y más seguro para este patrón de tráfico.
- **VPC Gateway Endpoint de S3:** sin costo adicional, evita que ECS pague de más por bajar capas de ECR.

## Lo que evitaría en una primera versión

- **La mitad de los VPC Endpoints Interface:** si en staging corrés una sola AZ, son 4 endpoints en vez de 8 ENIs.
- **RDS Multi-AZ en staging:** una instancia Single-AZ db.t4g.micro sale la mitad ya que Multi-AZ solo se justifica para producción.
- **CloudFront en desarrollo:** agregarlo solo cuando se necesite dominio propio, en dev se puede servir el bundle directo desde S3.
- **Un solo Fargate task en staging:** sin necesidad de 2 tareas para alta disponibilidad.
