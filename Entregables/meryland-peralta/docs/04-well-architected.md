
1. Excelencia Operativa
Se utilizará Amazon CloudWatch para recopilar métricas y registros del backend, permitiendo monitorear el estado de la aplicación y atendiendo rápidamente cualquier alarma.
Por otro lado ,el backend se desplegará mediante imágenes Docker almacenadas en Amazon ECR y ejecutadas en Amazon ECS Fargate, facilitando la actualización de nuevas versiones.
¿Qué mejoraría?
Implementaría un proceso de integración y despliegue continuo (CI/CD) utilizando GitHub Actions para automatizar la publicación de nuevas versiones del backend.

2. Seguridad
Las credenciales de la base de datos se almacenarán en AWS Secrets Manager, evitando incluir información sensible en el código.
Los permisos de acceso a los recursos de AWS serán administrados mediante AWS IAM, aplicando el principio de mínimo privilegio.
¿Qué mejoraría?
Implementaría AWS WAF para proteger la aplicación frente a ataques web comunes y habilitaría autenticación multifactor (MFA) para los usuarios administradores.

3. Fiabilidad
La información de SalonBook se almacenará en Amazon RDS PostgreSQL, aprovechando sus respaldos automáticos y la posibilidad de habilitar alta disponibilidad (Multi-AZ).
El Application Load Balancer distribuirá el tráfico entre las tareas del backend y realizará verificaciones de estado para detectar servicios no disponibles.
¿Qué mejoraría?
Implementaría una estrategia de recuperación ante desastres en una segunda región de AWS para garantizar la continuidad del servicio ante una falla regional.

4. Eficiencia de Rendimiento
El frontend será distribuido mediante Amazon CloudFront, reduciendo la latencia y acelerando la carga del sitio web.
¿Qué mejoraría?
Incorporaría Amazon ElastiCache (Redis) para almacenar temporalmente información consultada con frecuencia, como los horarios disponibles, reduciendo la carga sobre la base de datos.

5. Optimización de Costos
Se eligieron servicios administrados como Amazon S3, Amazon ECS Fargate y Amazon RDS, ya que permiten iniciar con recursos pequeños y aumentar la capacidad únicamente cuando la aplicación lo requiera.
¿Qué mejoraría?
Utilizaría AWS Cost Explorer y AWS Budgets para monitorear el consumo mensual e identificar oportunidades de optimización de costos.

6. Sostenibilidad
El uso de Amazon ECS Fargate evita mantener servidores dedicados sin utilización, ya que los recursos se asignan según la demanda.
La arquitectura basada en servicios administrados permite utilizar únicamente los recursos necesarios para el funcionamiento de la aplicación.
¿Qué mejoraría?
Configuraría políticas de Auto Scaling para ajustar automáticamente la cantidad de contenedores en ejecución según la carga de trabajo, reduciendo el consumo de recursos cuando la demanda sea baja.
