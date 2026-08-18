Región primaria São Paulo (sa-east-1), con una arquitectura de alta disponibilidad distribuida en dos Availability Zones. La aplicación tiene acceso público para clientes de Argentina, México y Brasil. La arquitectura separa la capa de entrada, cómputo, persistencia y servicios de soporte, manteniendo la base de datos y las tareas de aplicación en subredes privadas. El diseño completo se muestra en el Anexo B.

Entrada: Route 53 → CloudFront (con WAF) → S3 / ALB

Route 53 resuelve el dominio hacia CloudFront, que termina la conexión TLS y tiene WAF asociado. Desde CloudFront, el contenido estático se sirve desde S3 y las solicitudes de la API (/api/*) se envían al ALB.

Para evitar el acceso directo al ALB y el bypass de CloudFront/WAF, el ALB acepta únicamente tráfico proveniente de CloudFront mediante el managed prefix list correspondiente.

Cómputo → ECS sobre Fargate

Elegí Fargate porque mi aplicación ya está dockerizada y no quiero administrar el sistema operativo de los servidores. ECS con Fargate me permite ejecutar los contenedores sin gestionar la infraestructura subyacente.

Descarté EC2 porque implicaría administrar servidores y su sistema operativo; EKS porque Kubernetes agrega una complejidad que no se justifica para una aplicación de este tamaño; Lightsail porque está más orientado a proyectos simples; y Elastic Beanstalk porque prefiero tener mayor control sobre cómo se integran el balanceador, los contenedores, el auto scaling y el resto de los servicios de la arquitectura.

Base de datos → RDS PostgreSQL Multi-AZ

Elegí Amazon RDS PostgreSQL porque necesito una base relacional administrada. AWS se encarga de tareas de administración como parches, backups y operación de la infraestructura. La configuración Multi-AZ mantiene una instancia standby en otra zona de disponibilidad y, ante una falla, RDS realiza el failover hacia esa instancia.

Almacenamiento → dos buckets S3 + Lifecycle/Glacier

S3 frontend: privado, servido por CloudFront con OAC, sin acceso directo al bucket.

S3 material: privado, con acceso autorizado mediante URLs firmadas para que solo puedan acceder los usuarios que compraron el curso.

Lifecycle + versionado: el material utiliza versionado para poder recuperar un archivo borrado o reemplazado accidentalmente. La política de Lifecycle mantiene las versiones actuales en S3 Standard y mueve las versiones antiguas a Glacier o las elimina después de un plazo definido, evitando acumular almacenamiento innecesario.

Red → VPC propia, dos AZ

VPC propia con CIDR 10.0.0.0/16, aislada por defecto. Se utilizan subredes públicas y privadas en dos AZ. En las públicas se ubican el ALB y un NAT Gateway por AZ (NAT-A y NAT-B), mientras que la VPC tiene asociado un Internet Gateway. La separación de NAT por AZ evita tener un único punto de falla para la salida a Internet. En las privadas se ejecutan Fargate y RDS.

Se utilizan VPC Endpoints para que Fargate acceda por red privada a S3, ECR (API y DKR, para obtener las imágenes de los contenedores), CloudWatch Logs y Secrets Manager. Se descartó Transit Gateway porque está orientado a escenarios con múltiples VPC y en este diseño se utiliza una única VPC.

Seguridad

Se utilizan grupos de seguridad: el ALB acepta tráfico HTTPS (443) únicamente desde CloudFront; Fargate acepta tráfico únicamente desde el ALB; y RDS acepta conexiones PostgreSQL (5432) únicamente desde Fargate. Los secretos se almacenan en Secrets Manager y se protegen con KMS. CloudTrail registra las acciones realizadas sobre los recursos para fines de auditoría.

Identidad y pagos

Los clientes se autentican mediante un Cognito User Pool. Obtienen un token (JWT) y la API valida ese token para autorizar las operaciones de compra.

Los pagos se delegan a una pasarela externa, por lo que Roversec no almacena datos de tarjetas y se reduce el alcance de PCI-DSS, aunque no se elimina por completo.

Acceso administrativo

RDS no tiene acceso público. Para tareas administrativas puntuales, se accede a la base desde un recurso de cómputo dentro de la red privada, autorizado para comunicarse con RDS. El acceso administrativo a ese recurso se realiza mediante ECS Exec y está controlado por IAM. No se expone la base a Internet ni se mantiene un bastion.
