# 03 — Propuesta de infraestructura AWS

## Diagrama

Ver: `diagrams/arquitectura-aws.png`

## Flujo de tráfico

```
Usuario
│
▼
Route 53 (DNS)
│
▼
CloudFront (CDN + TLS)
│
├──► Amazon S3 (Frontend estático HTML/JS/CSS)
│
└──► Application Load Balancer (/api/*)
│
▼
ECS Fargate (Backend FastAPI)
│
├──► RDS PostgreSQL + PostGIS (Multi-AZ, subnet privada)
├──► S3 Bucket (Comprobantes y Recetas)
├──► Secrets Manager (credenciales)
└──► CloudWatch (logs y métricas)

ECR ──► ECS Fargate (registro de imágenes Docker)
S3  ──► backups de RDS
```

## Servicios y justificación

| Servicio | Rol | Por qué |
|----------|-----|---------|
| **ECS Fargate** | Orquestación de contenedores | Sin gestión de EC2 ni costo de control plane (descartando EKS). Escala la API de donaciones según demanda. |
| **RDS PostgreSQL (PostGIS)** | Base de datos gestionada | Garantiza transacciones ACID para reservas de stock y resuelve búsquedas de cercanía geográfica mediante PostGIS. Multi-AZ. |
| **S3 (Frontend & Media)** | Hosting estático y almacenamiento | Guarda la interfaz web y las fotos de comprobantes/recetas cargadas con costo mínimo y 99.99% de disponibilidad. |
| **CloudFront** | CDN & Edge Routing | Servir el frontend desde la red de borde y enrutar las llamadas de la API (`/api/*`) al ALB, absorbiendo picos de tráfico. |
| **ALB** | Load balancer | Distribuye peticiones hacia los contenedores de FastAPI en subredes privadas y ejecuta health checks. |
| **ECR** | Registro de imágenes Docker | Almacena y versiona de forma segura las imágenes privadas de la API y Nginx para ECS. |
| **Route 53** | DNS | Gestión de dominio público con baja latencia y chequeos de salud. |
| **ACM** | Certificados TLS | Certificados SSL/HTTPS gratuitos con renovación automática para la CDN y el Load Balancer. |
| **Secrets Manager** | Credenciales de la DB | Almacena y rota las contraseñas de la base de datos sin exponerlas jamás en el código fuente. |
| **CloudWatch** | Logs y métricas | Centraliza registros del backend FastAPI (`awslogs`) y dispara alertas si la API o base de datos saturan. |
