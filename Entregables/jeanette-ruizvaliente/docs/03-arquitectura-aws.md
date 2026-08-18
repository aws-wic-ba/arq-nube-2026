# 03 — Propuesta de arquitectura en AWS

Localmente todo corre en un contenedor con SQLite embebido. Para producción,
separo la app en piezas que se puedan escalar y fallar de forma independiente,
y trato distinto el dashboard interno (uso del equipo de Account
Management) de la ruta pública por la cual el cliente deja su valoración,
porque tienen perfiles de riesgo distintos.

## Servicios propuestos

| Servicio | Para qué lo uso | Por qué |
|---|---|---|
| **Amazon ECR** | Registro de la imagen Docker de la app | Es el mismo Dockerfile que ya tengo local — subir esa imagen a un registro privado es el primer paso para no depender de mi máquina para desplegar. |
| **Amazon ECS (Fargate)** | Corre los contenedores de la app | Elijo Fargate en vez de EC2 porque no quiero administrar servidores: si un Account Manager entra al dashboard a las 9am y hay un pico de uso, Fargate escala los contenedores sin que yo tenga que administrar. Menor operación. |
| **Application Load Balancer (ALB)** | Reparte tráfico entre los contenedores | Al tener un sistema interno y otro donde el cliente accede públicamente, necesito algo que distribuya las requests con mayor seguridad y además me permita separar por ruta. |
| **Amazon RDS (PostgreSQL, Multi-AZ)** | Reemplaza el SQLite local | SQLite no soporta bien múltiples conexiones. RDS Multi-AZ además mantiene una réplica en otra zona de disponibilidad, para no perder acceso a los datos de los clientes ante una falla de zona. Además, sostiene consultas complejas y conviene a nivel operativo si es para una corporación. |
| **AWS WAF** | Protege la ruta pública | Es el único punto de la app que queda abierto a cualquiera en internet sin login. WAF permite filtrar patrones de ataque comunes (bots, inyección) antes de que lleguen a los contenedores. |
| **Amazon Cognito** | Login para el dashboard interno | Hoy la app no tiene autenticación — cualquiera con la URL entra. Antes de producción, el dashboard interno necesita login. |
| **Amazon S3** | Almacena los assets estáticos (CSS, imágenes) | Es el origen real de esos archivos — separarlos del contenedor de la app evita que Fargate tenga que servir contenido que nunca cambia. |
| **Amazon CloudFront** | Entrega esos assets estáticos vía CDN | Cachea copias de esos archivos en ubicaciones más cercanas al usuario, así cada carga del dashboard es más rápida y esas requests ni siquiera llegan a Fargate. |
| **AWS Secrets Manager** | Lo utilizo para guardar las credenciales de RDS | Así el usuario y contraseña de la base de datos no quedan hardcodeados en el código ni en variables de entorno planas. |
| **Amazon CloudWatch** | Logs y alarmas | Monitorear uso de CPU, conexiones cerca del límite, o consultas lentas — cosas que si no las ves a tiempo, sí impactan al usuario. |
| **Route 53 + ACM** | Dominio propio y certificado HTTPS | Un dashboard de gestión comercial entra por HTTPS, sin excepción — más todavía si el formulario público le pide datos a un cliente externo. |

Ver diagrama en `diagrams/DiagramaArq.26.drawio.png`
