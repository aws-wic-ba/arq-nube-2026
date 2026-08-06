# 05 — Estimación de costos

## Servicios con mayor costo

| Servicio | Costo estimado/mes | Notas |
|----------|-------------------:|-------|
| Amazon RDS PostgreSQL (Multi-AZ) | ~USD 90 | Principal componente debido a la alta disponibilidad y replicación Multi-AZ. |
| Amazon EC2 (t3.micro) | ~USD 8.50 | Ejecuta la aplicación web desarrollada en Flask. |
| Amazon S3 | < USD 2 | Almacenamiento de imágenes, radiografías y documentos clínicos. |
| Amazon CloudWatch | < USD 5 | Monitoreo de la infraestructura y almacenamiento de logs. |
| Amazon Route 53 | ~USD 1 | Gestión del dominio y resolución DNS. |

**Costo mensual estimado:** **~USD 110** para un consultorio odontológico de pequeña escala.

---

## Decisiones de optimización tomadas

- Utilizar una única instancia **Amazon EC2** para el MVP.
- Incorporar únicamente los servicios necesarios para el alcance del proyecto.
- Almacenar archivos en **Amazon S3**, evitando utilizar la base de datos para documentos e imágenes.
- Diseñar una arquitectura preparada para crecer sin sobredimensionar la infraestructura desde el inicio.

---

## Lo que evitaríamos en una primera versión

Con el objetivo de mantener bajos los costos operativos durante la etapa inicial del proyecto, se decidió no incorporar:

- Application Load Balancer (ALB).
- Auto Scaling.
- Múltiples instancias Amazon EC2.
- Servicios adicionales que incrementen el costo sin aportar valor al volumen esperado de usuarios.

Estas funcionalidades podrán incorporarse en futuras versiones de OdontoGest a medida que aumente la cantidad de usuarios y la demanda del sistema.

---

## Herramienta utilizada

La estimación de costos fue realizada utilizando la **AWS Pricing Calculator**, considerando los servicios seleccionados para la arquitectura propuesta y el escenario de un consultorio odontológico de pequeña escala.