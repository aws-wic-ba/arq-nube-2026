# 03 — Arquitectura AWS

## Diagrama

Ver: `diagrams/arquitectura-aws.png`

---

## Flujo de la solución

```
Usuario
   │
   ▼
Route 53 (DNS)
   │
   ▼
Amazon EC2
(Flask + Docker)
   │
   ├──► Amazon RDS PostgreSQL (Multi-AZ)
   ├──► Amazon S3 (archivos y documentos)
   ├──► AWS Secrets Manager (credenciales)
   ├──► Amazon CloudWatch (logs y métricas)
   └──► Amazon SNS (notificaciones)

AWS IAM
   │
   └──► Control de permisos y accesos
```

---

## Servicios utilizados y justificación

| Servicio | Función | Justificación |
|----------|----------|---------------|
| **Amazon EC2** | Hospedar la aplicación web | Ejecuta la aplicación Flask dentro de un contenedor Docker. Se eligió por su simplicidad, flexibilidad y bajo costo para una solución de pequeña escala. |
| **Amazon RDS PostgreSQL (Multi-AZ)** | Base de datos | Almacena la información del consultorio. La configuración Multi-AZ mejora la disponibilidad y permite recuperación automática ante fallos. |
| **Amazon S3** | Almacenamiento de archivos | Guarda radiografías, fotografías y documentos clínicos sin ocupar espacio en la base de datos. |
| **AWS IAM** | Gestión de identidades | Aplica el principio de mínimo privilegio para controlar los permisos de usuarios y servicios. |
| **Security Groups** | Seguridad de red | Restringen el acceso únicamente a los puertos necesarios y protegen la base de datos del acceso público. |
| **AWS Secrets Manager** | Gestión de credenciales | Almacena de forma segura las contraseñas y datos sensibles utilizados por la aplicación. |
| **Amazon CloudWatch** | Monitoreo | Centraliza métricas, registros y alertas para detectar incidentes rápidamente. |
| **Amazon SNS** | Notificaciones | Envía alertas cuando CloudWatch detecta eventos críticos en la infraestructura. |
| **Amazon Route 53** | DNS | Dirige las solicitudes de los usuarios hacia la aplicación publicada en Amazon EC2. |

---

## Consideraciones de diseño

La arquitectura fue diseñada priorizando los siguientes objetivos:

- Simplicidad de administración.
- Alta disponibilidad de la base de datos mediante Multi-AZ.
- Separación entre archivos y datos relacionales.
- Seguridad basada en el principio de mínimo privilegio.
- Monitoreo continuo de la infraestructura.
- Posibilidad de escalar la solución en futuras versiones sin modificar la arquitectura principal.