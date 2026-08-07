# 05: Estimación y decisiones de costos

La arquitectura de Gentle Task Companion es totalmente serverless y basada en demanda (on-demand), lo que permite escalar a cero. Cuando no hay tráfico activo, la aplicación no genera costos de cómputo ni de transferencia de datos. Para un uso personal o de pequeña escala, el presupuesto mensual se mantiene en montos mínimos (entre 1 y 3 USD al mes).

## Desglose de costos por servicio

A baja escala, la capa gratuita de AWS (Free Tier) cubre la mayor parte del consumo operativo. A continuación se detallan los esquemas de precios y las estimaciones mensuales para un escenario de uso bajo o personal.

| Servicio AWS | Modelo de cobro | Incluido en Free Tier | Estimación uso bajo |
|---|---|---|---|
| KMS (CMK) | $1.00/mes por clave (CMK) + $0.03 por 10.000 solicitudes | 20.000 solicitudes/mes gratis | ~$1.00 USD/mes (costo base fijo) |
| DynamoDB | $0.25 por millón de escrituras / $0.05 por millón de lecturas / $0.25/GB-mes | 25 GB de almacenamiento + 25 WCU / 25 RCU gratis | $0.00 a $0.50 USD/mes |
| S3 | $0.023 por GB almacenado + solicitudes PUT/GET | 5 GB de almacenamiento estándar (12 meses) | < $0.10 USD/mes |
| CloudFront | $0.085 por GB transferido + solicitudes | 1 TB de transferencia de salida mensual (siempre gratis) | $0.00 USD/mes |
| API Gateway (HTTP API) | $1.00 por millón de solicitudes | 1 millón de solicitudes/mes (12 meses) | $0.00 a $0.20 USD/mes |
| AWS Lambda | $0.20 por millón de solicitudes + $0.0000166667 por GB-segundo | 1 millón de solicitudes y 400.000 GB-segundos/mes gratis | $0.00 USD/mes |
| Amazon SQS + DLQ | $0.40 por millón de solicitudes tras la capa gratuita | 1 millón de solicitudes/mes (siempre gratis) | $0.00 USD/mes |
| Amazon Cognito | $0.0055 por MAU tras los primeros 50.000 | 50.000 usuarios activos mensuales (MAU) gratis | $0.00 USD/mes |

### Resumen del presupuesto mensual

- En la configuración más barata (cifrado gestionado por AWS y sin dominio propio), a escala personal el costo ronda **$0 a $1 por mes**, en buena parte cubierto por el Free Tier.
- Costo fijo recortable del lado de AWS: una clave KMS propia (CMK, ~$1/mes; se evita usando cifrado gestionado por AWS). Un dominio propio suma el DNS gestionado en Route 53 (~$0.50/mes); un registrador externo tiene un costo similar, solo que en otro proveedor. Para pruebas alcanzan las URLs por default de CloudFront/API Gateway.
- Pasado el primer año vencen algunos free tiers de 12 meses (S3, API Gateway), pero a bajo volumen el total sigue en el orden de uno o dos dólares por mes.

## Decisiones de diseño para la optimización de costos

1. Modo de capacidad On-Demand en DynamoDB: En lugar de aprovisionar capacidad fija de lecturas y escrituras (que genera cobros continuos por capacidad ociosa), se utiliza el modo On-Demand. El sistema paga únicamente por las lecturas y escrituras efectivas realizadas por la aplicación.
2. API Gateway HTTP APIs en lugar de REST APIs: Se seleccionó API Gateway en su modalidad HTTP API, la cual ofrece una reducción del 70% en el costo por millón de solicitudes en comparación con API Gateway REST API ($1.00 USD frente a $3.50 USD por millón). Además, ofrece menor latencia y soporte nativo para autorizadores JWT sin requerir funciones Lambda personalizadas para la validación del token.
3. Descarga y carga mediante S3 Pre-signed URLs: La transferencia de archivos multimedia (recursos pesados, imágenes y tarjetas de apoyo) se gestiona enviando URLs prefirmadas directamente al navegador del usuario. De este modo, la subida y descarga de datos ocurre de forma directa entre el cliente PWA y Amazon S3, evitando transmitir bytes a través de funciones Lambda. Esto reduce el consumo de tiempo de ejecución y memoria en cómputo serverless.
4. Desacoplamiento eficiente con Amazon SQS + DLQ: la ingesta asíncrona de favoritos de animalitos se encola en Amazon SQS. La capa gratuita permanente de SQS (1 millón de solicitudes al mes) mantiene el costo en cero para el volumen de la app, y la DLQ evita que los reintentos de mensajes fallidos consuman invocaciones innecesarias de Lambda.
5. Build AWS-emulado a costo cero con MiniStack y OpenTofu: el build AWS-emulado usa OpenTofu + MiniStack para levantar los servicios de AWS (Cognito, DynamoDB, S3, SQS, Lambda, API Gateway) en un contenedor local, con costo de nube nulo durante el desarrollo y las pruebas, sin credenciales de pago ni tráfico a la nube.
6. Alerta de presupuesto con AWS Budgets: como la arquitectura serverless escala sola, un pico de tráfico inesperado podría disparar el gasto. Se define un presupuesto mensual (por ejemplo, 5 USD) con notificación por email al 80% y al 100% del umbral. AWS Budgets incluye dos presupuestos sin cargo, así que la alerta no suma costo.
7. Techo de gasto ante picos: para que un flood o un abuso no dispare la factura, se acota el peor caso con throttling en API Gateway (límites de rate y burst) y reserved concurrency en Lambda (tope de ejecuciones simultáneas). Ambos son gratuitos y complementan al presupuesto de arriba; a nivel de red, CloudFront ya suma AWS Shield Standard sin costo.

## Componentes omitidos voluntariamente para controlar el gasto

- Sin instancias NAT Gateway: Las funciones Lambda operan fuera de VPC para acceso directo a endpoints gestionados de AWS sin pagar por tráfico de red ni horas de instancia NAT.
- Sin bases de datos relacionales administradas (RDS / Aurora): Se evita el costo mínimo de una instancia RDS ejecutándose las 24 horas del día, el cual suele superar los 15 USD al mes.
- Sin servidores virtuales permanentes (EC2 / ECS Fargate continuo): Todo el backend responde exclusivamente en un esquema serverless accionado por eventos.
