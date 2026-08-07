# 05 — Estimación de costos

Estimación armada con la [AWS Pricing Calculator],
para la región `us-east-1`, asumiendo un uso bajo (lotes de identidades
chicos, algunas corridas por día — no tráfico constante).

## Servicios más costosos

| Servicio | Costo estimado/mes | Notas |
|---|---|---|
| **NAT Gateway** (bajo EC2) | ~$32.85 | 730 hs (mes completo) — se cobra por estar desplegado, no por uso real. Es, por lejos, el componente más caro de toda la arquitectura. |
| **Secrets Manager** | ~$0.40 | Costo fijo por el secreto del token de Jira (1 secreto almacenado). |
| **S3** | ~$0.37 | Storage + requests para el JSON de entrada y los reportes de salida (~5 GB). |
| **API Gateway** *(Fase 2, no desplegado hoy)* | ~$0.04 | Estimado para 10.000 requests — recién aplica cuando haya un PAM real consultando. |
| **WAF** *(Fase 2, no desplegado hoy)* | ~$0.01 |por request; en un despliegue real WAF también tiene un cargo fijo mensual por Web ACL (~$5) que no incluí en simulación — hay que sumarlo aparte si se activa. |
| **Lambda** | ~$0.00 | 1.000 GB-segundos en ARM (Graviton) — no se sale del free tier. |
| **CloudWatch / SNS** | ~$0.00 | Bajo volumen de logs y alarmas. |

**Total estimado: ~$33.68/mes**, y el NAT Gateway es hoy el costo más elevado y cuando se incorpore el WAF serán ~$5 más .

*(DynamoDB, KMS y SQS  — a este volumen su
costo es prácticamente $0)*

## Decisiones de optimización tomadas

- **Todo serverless donde fue posible** (Lambda, DynamoDB, S3): sin
  servidor prendido 24/7 pagando por capacidad ociosa.
- **Lambda en ARM (Graviton)** en vez de x86: más barato con igual o
  mejor rendimiento para este tipo de carga.
- **Separación de storage**: los reportes pesados van a S3, en
  DynamoDB solo la metadata liviana — sin duplicar el mismo dato en
  dos lugares.

## Lo que evitaría en una primera versión

- **NAT Gateway**: para el MVP y las pruebas iniciales, dejo la
  Lambda **fuera de la VPC** — así se conecta a S3, DynamoDB, Secrets
  Manager y Jira sin necesitar NAT, y me ahorro los ~$33/mes. Recién lo agregaría cuando el
  aislamiento de red sea un requisito real de seguridad del banco,
  no antes.
- **WAF**: activarlo solo cuando el API Gateway esté realmente
  expuesto a un PAM externo — no tiene sentido pagar el cargo fijo
  mensual si todavía no hay nadie consumiendo esa API.
- **API Gateway completo**: toda la Fase 2 (WAF + API Gateway +
  integración PAM) la dejo para cuando haya un consumidor real del
  otro lado — hoy es diseño, no implementación.

## Región

Elegí `us-east-1` por costo y disponibilidad de servicios.

