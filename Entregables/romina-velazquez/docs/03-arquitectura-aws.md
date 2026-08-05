## 03 — Propuesta de infraestructura AWS

## Flujo de trabajo

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
ECS Fargate (contenedores de la app FastAPI)
  │
  ├──► Amazon EFS (Volumen persistente para el archivo SQLite `database.db`)
  ├──► Secrets Manager (credenciales)
  └──► CloudWatch (logs y métricas)

ECR ──► ECS Fargate (registro de imágenes Docker)
S3  ──► backups automáticos del archivo SQLite

## Servicios y justificación

ECS Fargate
Rol: Orquestación de contenedores
Por qué: Sin gestión de servidores, escala automáticamente

Amazon EFS: 
Rol: Almacenamiento persistente
Por qué: Permite montar un volumen compartido para mantener el archivo SQLite (database.db) persistente ante reinicios de contenedores

ALB: 
Rol: Load balancer
Por qué: Distribuye tráfico y hace health checks

ECR: 
Rol: Registro de imágenes Docker
Por qué: Integrado con ECS, privado y versionado

Route 53: 
Rol: DNS
Por qué: Failover automático entre regiones

CloudFront: 
Rol: CDN
Por qué: Reduce latencia, termina TLS en el edge

ACM:
Rol: Certificados TLS
Por qué: Gratis, renovación automática

Secrets Manager:
Rol: Credenciales de la DB
Por qué: Las contraseñas nunca van al código

CloudWatch:
Rol: Logs y métricas
Por qué: Alertas automáticas si algo falla

S3:
Rol: Backups
Por qué: Almacenamiento de snapshots del archivo SQLite con lifecycle policies