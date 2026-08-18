# Plataforma de Donaciones — Hospital Pediátrico Oncológico

Arquitectura serverless en AWS para la gestión de donaciones de una fundación dedicada a un hospital pediátrico oncológico. Este repositorio contiene la **Fase 1** del proyecto: el flujo completo de registro de donantes, desde el formulario web hasta el almacenamiento en base de datos.

> Nota sobre el entorno: este proyecto fue desarrollado y desplegado en **AWS Academy Learner Lab**, una cuenta de AWS con recursos reales facilitada por mi curso de arquitectura en la nube como entorno de práctica. Es un entorno educativo de duración limitada — los servicios, el código y los datos mostrados son 100% reales y funcionales, y desplegables igual en cualquier cuenta de AWS de producción.

## Video de demostración

Ver `evidence/video.md`

## Contenido de esta entrega

- `docs/` — Documentación del proyecto (descripción, arquitectura, Well-Architected, costos, disaster recovery)
- `diagrams/` — Diagramas de arquitectura (completo y Fase 1)
- `app/frontend/` — Formulario web (HTML/JS)
- `app/backend/` — Código de la función Lambda (Python)
- `evidence/` — Capturas de pantalla y link al video de demostración

## Arquitectura Fase 1 (implementada)
Donante → Formulario web → Amazon API Gateway → AWS Lambda → Amazon DynamoDB

Ver detalle completo en `docs/03-arquitectura-aws.md`.