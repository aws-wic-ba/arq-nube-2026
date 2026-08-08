# 05 — Estimación de costos

## Servicios más costosos

| Servicio | Costo estimado/mes | Notas |
| ----- | ----- | ----- |
| **Amazon DynamoDB** (Pay-per-request) | ~$2 - $5 | Depende del volumen de lecturas/escrituras y tamaño de la base de datos |
| **AWS Lambda** | ~$0 - $2 | Practicamente $0 dentro de la Capa Gratuita (Free Tier) |
| **Amazon API Gateway** (HTTP/REST API) | ~$1 - $3 | Costo basado en el número de solicitudes procesadas |
| **Amazon CloudFront + S3** | ~$1 - $2 | Almacenamiento estático del frontend y transferencia de datos |
| **Amazon CloudWatch Logs** | ~$1 - $3 | Depende del nivel de verbosidad de los logs retenidos |

*Total estimado:* **~$5 - $15/mes** para una carga pequeña/mediana (prácticamente $0/mes durante el primer año con AWS Free Tier).

## Decisiones de optimización tomadas

- **Arquitectura Serverless (Sin servidores dedicados):** Elimina el pago por instancias EC2, clusters de ECS o bases de datos RDS en ejecución continua, reduciendo el costo en reposo a $0.
- **Uso de DynamoDB On-Demand (Pay-per-request):** Evita pagar por capacidad aprovisionada que no se utiliza fuera del horario comercial.
- **Caché en CloudFront:** Reduce las llamadas directas a S3 y API Gateway para los recursos estáticos del frontend.
- **Retención limitada en CloudWatch Logs:** Configurada a 30 días para evitar acumulación continua de almacenamiento de logs.

## Lo que evitaríamos en una primera versión

- **DynamoDB Accelerator (DAX):** Innecesario para el volumen inicial; agregaría un costo fijo recurrente por nodo de caché.
- **AWS WAF frente a CloudFront/API Gateway:** Se puede prescindir en etapas iniciales si el tráfico es controlado para evitar costos fijos por regla.
- **Multi-Region / DynamoDB Global Tables:** Aumenta exponencialmente los costos de replicación de datos; no es necesario para una primera entrega local.

## Herramienta recomendada

Usar la [AWS Pricing Calculator](https://calculator.aws/) para estimar costos con los valores reales de su arquitectura.
