# 05 · Estimación de costos

> ✍️ Uso: [AWS Pricing Calculator](https://calculator.aws/) con los servicios descriptos en
> `03-arquitectura-aws.md` .

## Estimación mensual (borrador)

| Servicio                  | Configuración estimada        | Costo mensual aprox. |
| -------------------------- | ------------------------------ | --------------------- |
| ECS Fargate (app)          | ej: 0.25 vCPU / 0.5 GB, 1 tarea | `$ ...`                |
| RDS PostgreSQL              | ej: `db.t4g.micro`, single-AZ  | `$ ...`                |
| Application Load Balancer   | —                               | `$ ...`                |
| Data transfer / CloudWatch  | —                               | `$ ...`                |
| **Total estimado**          |                                 | **`$ ...`**            |

## Servicios más costosos de tu arquitectura

> ✍️ Completar: normalmente en este tipo de arquitectura el componente más caro suele ser la
> base de datos (sobre todo si la ponés en Multi-AZ) o el Load Balancer si el tráfico es bajo.
> Identificá cuál es en tu caso y por qué.

## Decisiones para optimizar costos

> Es importante decidir correctamente el tipo de instancia. Con una instancia `db.t4g.micro` de RDS alcanza.


## Qué evitarías o simplificarías en una primera versión

> en una primer version arranca sin Multi-AZ, sin CDN, con una sola instancia de ECS sin
> auto scaling. Se agrega en una siguiente version si el uso lo justifica.
