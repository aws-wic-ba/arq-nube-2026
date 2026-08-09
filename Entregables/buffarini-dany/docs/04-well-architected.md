# 04 · Well-Architected Framework

## Excelencia Operacional

La solución adopta ECS con Fargate eliminando la carga de gestión de infraestructura: no hay SO que parchear ni instancias que dimensionar manualmente. CloudWatch centraliza logs y métricas tanto de la aplicación como de RDS, lo que garantiza visibilidad completa post-despliegue sin depender de acceso directo a consola. El uso de ECR como registro de imágenes establece un pipeline reproducible: la misma imagen que funciona localmente es la que se despliega en AWS, reduciendo el riesgo de inconsistencias entre entornos. El ALB simplifica las operaciones de tráfico sin necesidad de gestionar IPs fijas.

## Seguridad

La arquitectura aplica el principio de menor privilegio y defensa en profundidad en dos capas. A nivel de red, la VPC con subred privada asegura que RDS nunca esté expuesta a internet — solo las tareas de ECS pueden conectarse a ella. A nivel de credenciales, Secrets Manager elimina el antipatrón de credenciales en texto plano (como el `docker-compose.yml` original), inyectando la `DATABASE_URL` en tiempo de ejecución. Las tareas Fargate acceden a Secrets Manager vía IAM roles, sin que ninguna credencial quede hardcodeada en el código ni en imágenes de contenedor.

## Confiabilidad

RDS for PostgreSQL provee backups automáticos y parches de seguridad gestionados, coherente con la estrategia de Backup & Restore definida en el plan de disaster recovery. La elección de no incluir Multi-AZ es una decisión consciente y justificada: dado que hay un único usuario, el costo adicional de alta disponibilidad no se justifica frente al RTO aceptable. El ALB actúa como punto de entrada estable, abstrayendo la naturaleza efímera de las tareas Fargate (sin IP fija) y permitiendo reemplazar tareas fallidas sin impacto en la URL de acceso.

## Eficiencia del Rendimiento

Fargate es la elección correcta para esta carga de trabajo: una app Actix-web de larga duración (long-running server) que no encaja con el modelo de Lambda (stateless, corta ejecución). El modelo de pago por uso de Fargate es eficiente para tráfico bajo — no se paga por capacidad ociosa de instancias EC2. La instancia RDS db.t4g.micro es proporcional a la demanda real de un usuario único, evitando el sobreaprovisionamiento. Si el tráfico creciera, la arquitectura permite escalar horizontalmente las tareas ECS detrás del ALB sin cambios estructurales.

## Optimización de Costos

Cada decisión tiene una lógica de costo explícita. Fargate elimina el costo fijo de instancias EC2 corriendo las 24hs. RDS sin Multi-AZ evita duplicar el costo de la base de datos cuando la disponibilidad extendida no es un requerimiento. Se descartó Route 53 y ACM porque para un único usuario la URL del ALB es suficiente, evitando costos adicionales de DNS y certificados. La arquitectura sigue un principio de right-sizing: cada servicio está dimensionado para el caso de uso real, no para una escala hipotética futura.

## Sustentabilidad

Al optar por Fargate en lugar de EC2, la solución consume recursos de cómputo únicamente cuando hay tareas corriendo, evitando que servidores permanezcan activos sin carga útil. El uso de RDS gestionado permite a AWS optimizar la utilización del hardware subyacente a mayor escala que una instancia propia. La elección de una instancia db.t4g.micro basada en arquitectura ARM (Graviton) ofrece mejor eficiencia energética por operación comparado con instancias x86 equivalentes. En general, la arquitectura evita la redundancia de infraestructura no justificada, lo que se traduce directamente en menor consumo de recursos físicos.
