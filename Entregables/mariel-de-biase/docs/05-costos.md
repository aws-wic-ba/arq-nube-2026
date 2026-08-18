# 05 — Estimación de costos

Estimación armada con la [AWS Pricing Calculator](https://calculator.aws),
región `us-east-1` (N. Virginia), para el escenario "bajo/intermedio" ya que es una app no diseñada para consumo masivo.

## Servicios más costosos

| Servicio | Costo estimado/mes | Notas |
|---|---|---|
| **VPC** | $32.89 | necesario porque Fargate está en subnet privada y no usamos ECR |
| **ECS Fargate** | $36.04 | 2 task, 0.5 vCPU / 1 GB, corriendo 24/7 |
| **ALB** | $22.27 | Costo fijo por hora +LCU |
| **RDS PostgreSQL** | $15.44 | `db.t3.micro`, Single-AZ, 20 GB |
| Route 53 | $0.90 | 1 hosted zone (dominio propio) |
| S3 | $0.12 | Fotos de los productos que se suben |
| Secrets Manager | $0.81 | 2 secretos (credenciales de RDS y `SECRET_KEY`) |
| **Total estimado** | **~$108.47/mes** | Para carga baja (uso familiar, no masivo) |


## Decisiones de optimización tomadas

- **RDS Single-AZ** en vez de Multi-AZ: reduce el costo de la base de
  datos a la mitad.

## Qué evitaríamos o simplificaríamos en una primera versión

- Evaluar si el **ALB** se justifica desde el día uno con una sola task
  corriendo, o si en una v1 muy inicial alcanzaría con exponer
  directamente la task de Fargate (menos seguro, pero más barato) hasta
  tener usuarios reales.

- **1 sola task de Fargate** en vez de 2 desde el arranque.