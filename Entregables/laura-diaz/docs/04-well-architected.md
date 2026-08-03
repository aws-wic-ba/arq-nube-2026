# 04 — AWS Well-Architected Framework

## Excelencia Operativa

**Decisiones tomadas:**

- CloudWatch logs: centraliza los logs de los contenedores, con container insights habilitado para tener mejor visibilidad dentro de los containers.
- Fargate: modelo pay-as-you-go, serverless.
- RDS: maneja software patching.
- ECR: registro de images administrado, sin infraestructura de storage que aprovisionar o escalar.
- El deploy no tiene downtime porque hay 2 tasks de Fargate: ECS reemplaza las tasks (definiendo min tasks en ECS) de a una mientras el ALB sigue enrutando a las sanas).

**Qué mejoraríamos:**

- Hoy solo hay logs, no alarmas. Crearía alarmas basadas en métricas de CPU usage, memory usage y errores de ALB para enterarme si hay un problema antes que el usuario lo reporte.
- El deploy es manual (docker build + push a ECR): Incluiría un CI/CD para que cada push a main dispare los tests y despliegue la aplicación. Utilizaría servicios como AWS CodePipeline, AWS CodeBuild y AWS CodeDeploy.
- Tendría la aplicación escrita con CDK (IaC).
- Utilizaría ECS Deployment Circuit Breaker para rollback automático si un deploy nuevo falla.
- Utilizaría AWS X-Ray para trazar el request y obtener insights valiosos.
- Utilizaría AWS Parameter Store para guardar configuración que no es secreta (los secretos seguirían en Secrets Manager).
- Utilizaría EventBridge para crear alertas automáticas si un servicio falla.

---

## Seguridad

**Decisiones tomadas:**

- Credenciales de Fargate con RDS en Secrets Manager con la rotación automática del secreto activada una vez por día.
- Security Groups: solo el ALB es público, el ECS sólo acepta tráfico del ALB security group y RDS sólo acepta tráfico del ECS security group.
- Fargate y RDS se encuentran en subnets privadas, acceden a ECR (pull de la imagen de Docker), CloudWatch y Secrets Manager vía VPC Endpoints, sin salida a internet.
- Bucket S3 privado, accesible solo por CloudFront vía Origin Access Control.
- IAM con ECS roles aplicando el least privilege principle.
- Autenticación del backend a RDS por usuario/contraseña, con la contraseña gestionada y rotada automáticamente en Secrets Manager (no hardcoded, no en el código).
- VPC Flow logs (network traffic y DNS logs).

**Qué mejoraríamos:**

- Agregaría AWS WAF (con sus ACLs) delante de CloudFront.
- Utilizaría AWS Shield (protección contra ataques DDoS).
- Rate limiting en el `POST /tips`, que es público y sin autenticación.
- Si la app creciera, agregaría autenticación de usuarios con Amazon Cognito.
- Utilizaría CloudTrail para trazabilidad: monitorear, alertar, auditar acciones y cambios en el entorno en tiempo real.
- Aplicaría seguridad en profundidad (en todas las capas).
- Utilizaría Amazon Inspector para escanear automáticamente las imágenes Docker en ECR para buscar vulnerabilidades antes que llegue a producción.
- Cambiaría la autenticación del backend a RDS por IAM database authentication.

---

## Fiabilidad

**Decisiones tomadas:**

- Fargate corre un mínimo de 2 tasks, una por AZ: si una AZ cae, la otra sigue sirviendo la app.
- RDS es Multi-AZ con standby síncrono, maneja los backups, detección de falla automática y recovery. Permite point-in-time recovery (PITR).
- El ALB tiene `health` checks y solo enruta tráfico a tasks sanas.
- Route53 health checks para monitorear health y performance de la app.

**Qué mejoraríamos:**

- Utilizaría Resilience Hub para validar y realizar seguimiento continuo de la resiliencia de mis apps para reducir interrupciones.

---

## Eficiencia de Rendimiento

**Decisiones tomadas:**

- Frontend con contenido estático (S3 + CloudFront), cacheado en edge locations.
- Fargate escala horizontalmente agregando tasks (seteando un max de tasks) sin tener que gestionar servidores manualmente.
- Cómputo sólo donde hay lógica de negocio (la API), no para servir archivos estáticos.
- CloudFront como red global de edge locations ("go global in minutes").
- Seleccioné la base de datos según el patrón de acceso de los datos.
- Cachear las respuestas GET de la API en CloudFront.

**Qué mejoraríamos:**

- Configuraría Auto Scaling (tracking CPU/memoria del servicio de ECS) y aumentaria minimun tasks running.
- Si en el futuro RelocaPet necesitara mostrar contenido dinámico o personalizado por usuario en el frontend (por ejemplo, checklist pre-armado, o contenido que requiera lógica de servidor), migraría esa capa de S3+CloudFront a ECS Fargate. Hoy no es necesario porque el frontend es una SPA pura.
- Si en un futuro el tráfico crece, utilizaría Amazon ElastiCache delante del RDS, para cachear los resultados de los joins más pedidos.

---

## Optimización de Costos

**Decisiones tomadas:**

- S3+CloudFront para el frontend en vez de un contenedor corriendo 24x7.
- VPC Endpoints en vez de NAT Gateway: la API no llama a servicios externos, así que un NAT Gateway sería un costo fijo por hora sin ningún uso real.

**Qué mejoraríamos:**

- Evaluaría la posibilidad de usar Fargate con instancias Spot (agregaría un mensaje con posibles fuentes confiables para buscar información cuando mi app esté caída así no afectaría a ningúna mascota).
- Lifecycle policies en ECR para borrar imágenes viejas automáticamente y no acumular storage sin usar.
- Sumaría Cost Allocation Tags y configuraría una alarma en AWS Budgets.
- Utilizaría el AWS Billing and Cost Management para tener más detalle de servicios y gastos.
- Quizás haría uso de servicios más nuevos como FinOps Agent.
- AWS Cost Explorer y Trusted Advisor: Trusted Advisor hace chequeos básicos y da recomendaciones automáticas de ahorro.
- Utilizaría ElastiCache (mencionado arriba también) para reducir costos.

---

## Sostenibilidad

**Decisiones tomadas:**

- Servicios gestionados (Fargate y RDS) evitan sobreprovisionar hardware: se consume solo lo que se usa.
- CloudFront reduce la distancia de transporte de datos entre usuario y contenido.

**Qué mejoraríamos:**

- Correr sobre instancias Graviton (ARM), más eficientes energéticamente.
