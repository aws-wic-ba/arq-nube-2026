

Estimación mensual aproximada mediante AWS Pricing Calculator, utilizando como referencia la región primaria São Paulo (sa-east-1) y los supuestos definidos para una etapa inicial. No incluye impuestos ni planes de soporte. El costo real dependerá principalmente del tráfico, la transferencia de datos y el volumen de procesamiento de los NAT Gateway y CloudFront. El objetivo es establecer un orden de magnitud y explicitar los supuestos utilizados.

Supuestos

Cómputo: 2 tareas Fargate promedio, de 0,5 vCPU y 1 GB de memoria cada una, funcionando 24/7. Auto Scaling permite crecer hasta 6 tareas durante picos, pero esa capacidad máxima no se considera como costo permanente.

Base de datos: RDS PostgreSQL Multi-AZ, db.t3.medium, 100 GB de almacenamiento, funcionando 24/7.

Almacenamiento: 50 GB en S3 para frontend y material de cursos, con versionado y Lifecycle. Se consideran además 10 GB de versiones antiguas en Glacier Flexible Retrieval.

Red: 1 ALB y 2 NAT Gateway, uno por AZ. Para los NAT se supone un procesamiento total de 100 GB/mes (50 GB por gateway).

CloudFront: 100 GB/mes de transferencia y 1 millón de solicitudes HTTPS/mes, distribuidos entre Sudamérica y Estados Unidos según los supuestos cargados en la calculadora.

Identidad y monitoreo: 5.000 MAU en Cognito, 1 secreto en Secrets Manager, 20 métricas y 5 alarmas de CloudWatch, con aproximadamente 1 GB/mes de logs.

DR: región secundaria en us-east-1, sin cómputo permanente. Se consideran almacenamiento de S3, ECR y Secrets Manager; RDS se recupera mediante backups cross-region.

Estimación mensual

Subtotal de los componentes calculados: ~USD 735,67/mes, sin considerar el costo variable de transferencia adicional ni costos de recuperación ante un evento de DR.

Nota: el costo del ALB mostrado corresponde al consumo de LCU calculado. El cargo horario del ALB debe considerarse adicionalmente si no quedó incluido en el resultado final de la calculadora.

Decisiones de costo (y sus trade-offs)

El componente de mayor costo es RDS Multi-AZ, pero se justifica porque las compras y sus datos asociados son críticos para la operación y requieren alta disponibilidad.

Los dos NAT Gateway aumentan el costo frente a utilizar uno solo, pero permiten mantener la salida independiente por AZ y evitar un punto único de falla. Los VPC Endpoints reducen el tráfico hacia servicios AWS que de otro modo podría atravesar los NAT Gateway.

El Auto Scaling evita mantener permanentemente la capacidad máxima de Fargate: la estimación utiliza 2 tareas promedio y considera las 6 tareas como capacidad máxima para períodos de mayor demanda.

CloudFront permite entregar el contenido estático desde el edge y reducir las solicitudes que llegan al backend. S3 Lifecycle y Glacier reducen el costo de conservar versiones antiguas del material.

La región DR mantiene únicamente los recursos necesarios para recuperar el servicio y no una infraestructura productiva completa, por lo que no se paga un segundo entorno Fargate/ALB/RDS activo de forma permanente.

La estimación corresponde a la arquitectura productiva propuesta, que utiliza Multi-AZ y una región secundaria para DR. Para un entorno de desarrollo o pruebas podría reducirse el costo utilizando Single-AZ y sin infraestructura de DR, pero esas alternativas no representan la arquitectura final planteada para Roversec.


Componente | Estimación mensual
ECS / Fargate | USD 61,91
Application Load Balancer (LCU) | USD 2,01
RDS PostgreSQL Multi-AZ + 100 GB | USD 481,70
NAT Gateway ×2 | USD 145,08
S3 Standard | USD 2,65
S3 Glacier Flexible Retrieval | USD 0,08
CloudFront | USD 12,09
Cognito | USD 0,01
Secrets Manager | USD 0,01
CloudWatch | USD 7,59
SNS | USD 19,98
Route 53 | USD 0,90
S3 DR | USD 1,15
ECR DR | USD 0,10
 | 


Subtotal de los componentes calculados: ~USD 735,67/mes, sin considerar el costo variable de transferencia adicional ni costos de recuperación ante un evento de DR.
Nota: el costo del ALB mostrado corresponde al consumo de LCU calculado. El cargo horario del ALB debe considerarse adicionalmente si no quedó incluido en el resultado final de la calculadora.

