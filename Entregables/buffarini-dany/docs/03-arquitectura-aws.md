# 03 · Propuesta de arquitectura en AWS


## Servicios candidatos

| Servicio                     | Para qué serviría                                            |
| ----------------------------- | -------------------------------------------------------------- |
| **Amazon ECR**                | Guardar la imagen Docker de la app (la que construye tu `Dockerfile`) |
| **Amazon ECS (Fargate)**      | Correr el contenedor de la app sin administrar servidores      |
| **Amazon RDS for PostgreSQL** | Reemplazo administrado del contenedor `db` de tu `docker-compose.yml` |
| **Application Load Balancer** | Recibir el tráfico HTTP y repartirlo entre las tareas de ECS   |
| **Amazon Route 53**           | DNS — apuntar un dominio al Load Balancer                       |
| **AWS Certificate Manager**   | Certificado TLS/HTTPS para el dominio                           |
| **Amazon CloudWatch**         | Logs y métricas de la app y de la base de datos                 |
| **AWS Secrets Manager**       | Guardar la `DATABASE_URL` / credenciales de Postgres, en vez de tenerlas en texto plano |
| **Amazon VPC**                | Red privada: la base de datos no expuesta a internet, solo accesible desde ECS |

## Preguntas para armar tu justificación

Para cada servicio que decidas incluir, respondé (con tus palabras, en el documento):

- ¿Qué problema de tu app resuelve específicamente?
- ¿Qué alternativa descartaste y por qué? (ej: ECS Fargate vs. EC2 vs. Lambda; RDS vs. Aurora
  Serverless vs. seguir con un contenedor de Postgres)
- ¿Cómo se relaciona con las decisiones que ya tomaste en `01-descripcion.md` (quiénes son los
  usuarios, cuánto tráfico esperás)?

## Diagrama

Guardá el diagrama en `diagrams/arquitectura-aws.png`, usando los [íconos oficiales de AWS](https://aws.amazon.com/architecture/icons/)
en draw.io o Lucidchart. Como mínimo debería mostrar:

- El flujo de un request desde el usuario hasta la base de datos.
- Los límites de la VPC / subnets públicas y privadas (si las usás).
- Dónde vive la imagen Docker (ECR) y quién la despliega (ECS).
