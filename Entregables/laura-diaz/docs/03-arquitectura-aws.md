# 03 — Propuesta de infraestructura AWS

## Diagrama

Ver: `diagrams/arquitectura-aws.png`

## Flujo de tráfico

```
Client
  │
  ▼
Route 53 (DNS)
  │
  ▼
CloudFront ──(default: /*)────────► S3 (bundle React)
     │
     └──(behavior: /api/*)────────► Application Load Balancer
                                          │
                              ┌───────────┴────────────┐
                              ▼
                     Fargate (AZ-1)             Fargate (AZ-2)
                              │
                              └───────────┬────────────┘
                                          ▼
                              RDS PostgreSQL — PRIMARY (AZ-1)
                                          │
                                          ▼ (replicación síncrona)
                              RDS PostgreSQL

Fargate (AZ-1 y AZ-2) ──► VPC Endpoint y VPC Endpoint Gateway (S3) ──►  ECR
Fargate (AZ-1 y AZ-2) ──► VPC Endpoint ──► CloudWatch (logs y alarmas)
Fargate (AZ-1 y AZ-2) ──► VPC Endpoint ──► Secrets Manager (credenciales de RDS)

```

## Servicios y justificación

| Servicio                      | Rol                                                                | Por qué                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **S3**                        | Sitio stático de React                                             | Storage durable y barato, no hace falta cómputo corriendo para servir archivos que no cambian por request |
| **CloudFront**                | CDN que sirve contenido de S3 con HTTPS y cache en edge locations  | Reduce latencia, el único que accede al S3 mediante OAC (bucket privado)                                  |
| **ACM**                       | Certificados TLS para app.relocapet.com                            | Renovación automática sin costo ni mantenimiento manual                                                   |
| **Route53**                   | DNS de app.relocapet.com                             | Dominio propio de la app y de la API                                                                      |
| **ALB**                       | Punto de entrada público a la API y balanceador de carga           | Balancea carga entre AZs, health checks automáticos                                                       |
| **ECS Fargate**               | Ejecuta contenedor de la API (Node/Express)                        | Serverless, escalabilidad automática y pago por uso exacto                                              |
| **ECR**                       | Repositorio de la imagen de Docker                                 | Integración con ECS Fargate y versionado de imágenes                                                      |
| **RDS PostgreSQL**            | Base de datos relacional                                           | Multi-AZ, failover automático                                                                             |
| **VPC**                       | Aísla la red                                                       | Controla quién tiene acceso |
| **VPC Endpoints**             | Interface (ECR, Logs, Secrets Manager), Gateway (S3)               | Dan acceso privado a servicios de AWS sin salir a internet                                                |                                                 |
| **Secrets Manager**           | RDS password                                                       | Gestiona la contraseña por medio de un secreto (no hardcoded) y rota automáticamente                      |
| **IAM**                       | Permisos                                                           | Least Privilege principle                                                                                 |
| **CloudWatch**                | Monitoring                                                         | Logs, métricas y alertas                                                                                  |
