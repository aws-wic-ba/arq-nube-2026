# 05 — Estimación de costos

## Servicios utilizados (Fase 1)

| Servicio | Modelo de precio | Costo estimado/mes* |
|---|---|---|
| AWS Lambda | Pago por invocación + duración | Prácticamente $0 (dentro del free tier: 1M invocaciones/mes gratis) |
| Amazon API Gateway (HTTP API) | Pago por millón de peticiones | Prácticamente $0 para el volumen de una fundación pequeña |
| Amazon DynamoDB (On-Demand) | Pago por lectura/escritura real | Prácticamente $0 (free tier: 25 GB de almacenamiento y millones de solicitudes gratis) |
| Amazon S3 + CloudFront (frontend, producción) | Almacenamiento + transferencia | Unos pocos centavos/mes para un sitio estático pequeño |

**Total estimado: menos de $5/mes** para el volumen de tráfico
esperado de una fundación pequeña (cientos de donaciones mensuales),
gracias al modelo 100% serverless y *pay-per-use*.

*Estimación basada en AWS Pricing Calculator, sujeta al volumen real
de uso.*

## Decisiones de optimización tomadas

- **Serverless-first**: no hay instancias EC2, RDS ni contenedores
  corriendo de forma continua — se elimina el costo fijo mensual típico
  de arquitecturas basadas en servidores.
- **DynamoDB On-Demand** en lugar de capacidad reservada: se paga
  exactamente por lo que se usa, sin sobreaprovisionar para picos
  hipotéticos.
- **Sin NAT Gateway ni Load Balancer**: al no usar VPC con recursos
  privados que necesiten salida a internet, se evitan estos costos
  fijos (que en arquitecturas con contenedores suelen rondar los
  $20–35/mes cada uno).

## Costos previstos en fases futuras

| Servicio (fase futura) | Costo estimado/mes |
|---|---|
| Amazon Cognito | Gratis hasta 50,000 usuarios activos/mes |
| Amazon Aurora Serverless v2 (reportes financieros) | Desde ~$45/mes (mínimo de capacidad) |
| Amazon QuickSight (dashboard) | Desde $9/usuario/mes (Standard) |
| AWS WAF | ~$5/mes + $1 por regla |

## Herramienta recomendada

Usar la [AWS Pricing Calculator](https://calculator.aws) para
recalcular estimaciones a medida que se agreguen los servicios de
fases futuras.
