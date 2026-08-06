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
| **Amazon EC2** | Hospedar la aplicación web | Ejecuta la aplicación Flask dentro de un contenedor Docker. Elegi EC2 porque es de facil escalabilidad ademas de su optimizacion de costos. En esta intancia del proyecto es la herramienta que mas se adecua.|
| **Amazon RDS PostgreSQL (Multi-AZ)** | Base de datos | Almacena la información del consultorio. Para el proyecto, entendi que el servicio mas impresindible es la base de datos, la accesibilidad y recuperacion de los mismos. PostgreSQL no solo es solido, sino que cuenta con Muli-AZ lo que permite la facil recuperacion ante desastres |
| **Amazon S3** | Almacenamiento de archivos | Pense en este servicio, para los datos como los aduntos de las fichas clinicas, radiografias, imagenes, estudios, etc. |
| **AWS IAM** | Gestión de identidades | Pensado para gestionar los perfiles de distntos usuarios (Owner, recepcionista, odontologos, y hasta pacientes) . |
| **Security Groups** | Seguridad de red | Protege la base de datos de todo publico, y da acceso unicamente correspondiente segun quien acceda. |
| **AWS Secrets Manager** | Gestión de credenciales | Seguridad en las contraseñas y datos sensibles utilizados por la aplicacion. |
| **Amazon CloudWatch** | Monitoreo | Control de metricas, registros y alertas para detectar incidentes rapidamente, esta ultima funcion es la que creo mas imprescindible. |
| **Amazon SNS** | Notificaciones | Notificacion de alertas cuando CloudWatch detecta eventos criticos en la infraestructura. |
| **Amazon Route 53** | DNS | Escalable y de alta disponibilidad, donde enruta el trafico de nuestra EC2. Acompaña el crecimiento futuro sin necesidad de alterar la infraestructura.|

---

## Consideraciones de diseño

La arquitectura fue diseñada priorizando los siguientes objetivos:

- Simplicidad de administración.
- Alta disponibilidad de la base de datos mediante Multi-AZ.
- Separación entre archivos y datos relacionales.
- Seguridad basada en el principio de mínimo privilegio.
- Monitoreo continuo de la infraestructura.
- Posibilidad de escalar la solución en futuras versiones sin modificar la arquitectura principal.