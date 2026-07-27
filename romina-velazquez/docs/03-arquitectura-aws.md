# 03 — Propuesta de infraestructura AWS

Usuario (Navegador / App)
  │
  ▼
Route 53 (DNS - fitconnect.com)
  │
  ▼
CloudFront (CDN + TLS / Caching de assets estáticos y vistas)
  │
  ▼
Application Load Balancer (ALB)
  │
  ▼
ECS Fargate (Contenedores FastAPI corriendo la app y el dashboard)
  │
  ├──► RDS PostgreSQL (Base de datos transaccional de usuarios, DNI y ejercicios)
  ├──► Secrets Manager (Credenciales de acceso a base de datos y variables de entorno)
  └──► CloudWatch (Monitoreo de logs y métricas de FastAPI y Uvicorn)

ECR ──► ECS Fargate (Registro privado de imágenes Docker de la aplicación)
S3  ──► Almacenamiento de backups automatizados de RDS y reportes de entrenamiento