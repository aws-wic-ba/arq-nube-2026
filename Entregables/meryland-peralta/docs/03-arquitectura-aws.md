
Usuario
   │
   ▼
Route 53 (DNS)
   │
   ▼
CloudFront (CDN + HTTPS)
   │
   ▼
Amazon S3 (Frontend React)
   │
   ▼
Application Load Balancer
   │
   ▼
Amazon ECS Fargate (Backend Node.js)
   │
   ├──► Amazon RDS PostgreSQL
   ├──► AWS Secrets Manager
   └──► Amazon CloudWatch

Amazon ECR ───► ECS Fargate





| Servicio                      | Rol                              | ¿Por qué se eligió?                                                                                                                                                                      |
| ----------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Amazon Route 53**           | Administración del dominio (DNS) | Se utilizará para asociar un nombre de dominio a la aplicación, permitiendo que los usuarios accedan fácilmente mediante una dirección web en lugar de una dirección IP.                 |
| **Amazon CloudFront**         | Distribución de contenido (CDN)  | Se eligió para distribuir el contenido de la aplicación desde servidores cercanos a los usuarios, reduciendo el tiempo de carga y mejorando la experiencia de navegación.                |
| **Amazon S3**                 | Almacenamiento del frontend      | Se utilizará para alojar los archivos estáticos del frontend (HTML, CSS, JavaScript e imágenes), ofreciendo alta disponibilidad y un costo reducido.                                     |
| **Application Load Balancer** | Balanceador de carga             | Distribuirá las solicitudes entre las instancias del backend, evitando la sobrecarga de un solo servidor y permitiendo escalar la aplicación cuando aumente el número de usuarios.       |
| **Amazon ECS Fargate**        | Ejecución de contenedores Docker | Ejecutará los contenedores Docker del backend sin necesidad de administrar servidores, facilitando el despliegue y el escalamiento de la aplicación.                                     |
| **Amazon RDS PostgreSQL**     | Base de datos relacional         | Almacenará la información de usuarios, estilistas, servicios y reservas. Se eligió PostgreSQL porque la información de la aplicación mantiene relaciones entre las diferentes entidades. |
| **AWS Secrets Manager**       | Gestión segura de credenciales   | Almacenará las credenciales de la base de datos de forma segura, evitando que información sensible quede almacenada directamente en el código fuente.                                    |
| **Amazon CloudWatch**         | Monitoreo y registros            | Permitirá monitorear el estado de la aplicación mediante métricas y registros, facilitando la detección y solución de errores.                                                           |
| **Amazon ECR**                | Registro de imágenes Docker      | Almacenará las imágenes Docker del backend para que Amazon ECS Fargate pueda descargarlas y ejecutar la versión más reciente de la aplicación durante cada despliegue.                   |
