# 03 — Propuesta de infraestructura AWS

## Diagramas

- Diseño objetivo completo: `diagrams/diagrama-arquitectura-completo.pdf`
- Fase 1 implementada y probada: `diagrams/diagrama-fase1.pdf`

## Flujo de tráfico (Fase 1 — implementada)

```
Donante
  │
  ▼
Frontend (HTML/JS)
  │  HTTPS POST /donantes (JSON)
  ▼
Amazon API Gateway (HTTP API)
  │  invoca
  ▼
AWS Lambda (Python) — logica-donacion
  │  put_item()  [autenticado con IAM Role]
  ▼
Amazon DynamoDB — tabla Donantes
```

## Servicios y justificación (Fase 1)

| Servicio | Rol | Por qué |
|---|---|---|
| **AWS Lambda** | Cómputo del backend | Serverless: no se administra servidor, se paga solo por ejecución, escala automáticamente |
| **Amazon API Gateway (HTTP API)** | Puerta de entrada pública | Expone un endpoint HTTPS, enruta peticiones a la Lambda, gestiona CORS |
| **Amazon DynamoDB** | Base de datos | NoSQL serverless, on-demand, sin instancia que administrar, escala sola |
| **AWS IAM (Role)** | Permisos | La Lambda se autentica contra DynamoDB sin credenciales expuestas en el código |

**Por qué no se usa EC2:** el proyecto sigue una arquitectura
*serverless-first* — todo el cómputo se ejecuta en Lambda, sin
necesidad de aprovisionar ni mantener servidores.

## Diseño objetivo completo (fases futuras)

El diagrama completo contempla, además de lo ya implementado, los
siguientes servicios (ver `diagrams/diagrama-arquitectura-completo.pdf`):

| Servicio | Rol previsto |
|---|---|
| Amazon Cognito | Autenticación de donantes (User Pool) |
| AWS Step Functions | Orquestación del flujo de checkout a recibo |
| Amazon Aurora | Reportes financieros (módulo Donaciones) |
| Amazon QuickSight | Dashboard público de transparencia |
| Amazon CloudFront + AWS WAF + S3 | Hosting del frontend en producción, con protección web |
| Amazon EventBridge / SQS / SNS | Bus de eventos y notificaciones |
| AWS KMS / Secrets Manager | Gestión de claves y credenciales |
| AWS CloudTrail / GuardDuty / Macie / Config / Security Hub | Auditoría, detección de amenazas y cumplimiento |
| AWS Glue / Athena | Job nocturno de agregación anonimizada, único puente de datos hacia el dashboard público |

El diseño completo también separa, en una **cuenta AWS distinta**, el
módulo **Clínico (PHI)** — expedientes, tratamientos, aprobación de
quimioterapia, imágenes DICOM (AWS HealthImaging + Fargate) — aislado
del módulo público de Donaciones por una frontera de seguridad, con un
único puente de datos anonimizados y agregados (sin PHI) hacia el
dashboard de transparencia.
