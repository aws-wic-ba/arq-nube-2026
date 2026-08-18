# 05 — Estimación de costos

Estimación realizada con [AWS Pricing Calculator](https://calculator.aws/)
para una carga inicial de uso corporativo en la región **N. Virginia
(`us-east-1`)**.

## Desglose mensual de servicios

| Servicio | Configuración estimada | Costo estimado/mes |
| --- | --- | --- |
| **Amazon RDS PostgreSQL** | `db.t3.micro`, 20 GB gp2, Multi-AZ | $71.03 USD |
| **AWS Fargate** | 1 tarea activa (0.5 vCPU / 1 GB RAM) | $18.03 USD |
| **Application Load Balancer (ALB)** | 1 ALB | $16.44 USD |
| **AWS WAF** | 1 Web ACL + 2 Rule Groups | $9.06 USD |
| **Amazon CloudFront** | 10 GB transferencia saliente/mes | $0.85 USD |
| **Amazon CloudWatch** | 1 GB de logs + 2 alarmas | $0.70 USD |
| **Amazon Route 53** | 1 Hosted Zone | $0.50 USD |
| **AWS Secrets Manager** | 1 secreto + 10.000 llamadas API/mes | $0.45 USD |
| **Amazon ECR** | 2 GB almacenamiento de imágenes Docker | $0.20 USD |
| **Amazon S3 Standard** | 5 GB almacenamiento de estáticos | $0.12 USD |
| **Amazon Cognito** | 100 usuarios activos mensuales (Free Tier) | $0.00 USD |

**Total mensual:** $117.38 USD
**Total anual:** $1,408.56 USD

## Decisiones de optimización de costos

- **Dimensionamiento en Fargate:** se configuró una tarea continua de 0.5
  vCPU y 1 GB para responder a la disponibilidad 24/7 que requiere el
  dashboard, evitando pagar capacidad ociosa de instancias EC2 fijas.
- **Capa gratuita de Cognito:** para el perfil de usuarios internos (Account
  Managers), el volumen entra dentro del Free Tier de hasta 10.000 usuarios
  activos.
- **Consolidación de servicios:** se evita agregar servicios adicionales de
  almacenamiento en caché (como ElastiCache) en esta fase inicial.

## Estrategias de reducción para entornos de prueba (Staging)

- **Desactivar Multi-AZ en RDS:** representa más del 60% del costo total
  ($71.03). En un entorno de desarrollo o staging, usar una sola zona de
  disponibilidad reduce este gasto a la mitad.
- **Simplificación de WAF:** en etapas iniciales se puede usar un conjunto
  mínimo de reglas básicas antes de sumar Rule Groups adicionales.
- **Contenedores Fargate Spot:** en entornos de prueba no productivos, se
  puede optar por Fargate Spot para obtener hasta un 70% de descuento en el
  cómputo.
