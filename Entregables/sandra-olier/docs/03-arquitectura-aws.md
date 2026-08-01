# 03 — Propuesta de infraestructura AWS

## Diagrama

Ver: `diagrams/arquitectura-aws.drawio`

## Flujo de tráfico

Usuario
│
▼
Route 53 (DNS)
│
▼
CloudFront (CDN + TLS)
│
▼
Application Load Balancer
│
▼
ECS Fargate (contenedores de la app)
│
├──► RDS MySQL (Multi-AZ, subnet privada)
├──► Secrets Manager (credenciales)
└──► CloudWatch (logs y métricas)

ECR ──► ECS Fargate (registro de imágenes Docker)
S3  ──► backups de RDS + almacenamiento de archivos (ej: comprobantes de reserva)




## Servicios y justificación

| Servicio | Rol | Por qué |
|----------|-----|---------|
| **ECS Fargate** | Orquestación de contenedores | No requiere gestión de servidores, escala automáticamente según demanda |
| **RDS MySQL** | Base de datos gestionada | Multi-AZ, backups automáticos, consistencia transaccional para evitar reservas duplicadas |
| **ALB** | Load balancer | Distribuye tráfico entre contenedores y hace health checks |
| **ECR** | Registro de imágenes Docker | Integrado con ECS, privado y versionado |
| **Route 53** | DNS | Failover automático y gestión de dominios |
| **CloudFront** | CDN | Reduce latencia, entrega contenido estático y termina TLS en el edge |
| **ACM** | Certificados TLS | Gratis, renovación automática, seguridad en las comunicaciones |
| **Secrets Manager** | Credenciales de la DB | Las contraseñas nunca van en el código, rotación automática |
| **CloudWatch** | Logs y métricas | Monitoreo centralizado, alertas automáticas si algo falla |
| **S3** | Backups y archivos | Almacenamiento de snapshots de RDS y comprobantes de reserva, con lifecycle policies |
