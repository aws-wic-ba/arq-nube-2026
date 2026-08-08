### 04 — AWS Well-Architected Framework



### Excelencia Operativa

**Decisiones tomadas:**

* Logs centralizados en CloudWatch Logs con retención de 30 días
* Alarmas en CloudWatch si el error rate supera el 5%

**Qué mejoraríamos:** Pipeline de Despliegue Automatizado (CI/CD): AWS CodePipeline para que cada vez que se suba código a al repositorio, se ejecuten pruebas unitarias automáticamente, se construya la imagen Docker y se actualice el servicio ECS Fargate mediante un despliegue tipo Blue/Green (sin tiempo de inactividad).

### 

### Seguridad

**Decisiones tomadas:**

* La base de datos y los contenedores están en subredes privadas.
* La autenticación con DynamoDB se gestiona mediante Roles de IAM (AWS IAM), eliminando credenciales hardcodeadas.

**Qué mejoraríamos:** usar IAM Role para la Tarea de Fargate: Crear un rol con la política nativa AmazonDynamoDBFullAccess (o restringir solo a GetItem, PutItem, Scan sobre la tabla específica) y asignarlo como Task Role en el ECS Task Definition. Cifrado de Tráfico (HTTPS/TLS): El MVP actual viaja por HTTP (puerto 80). Es indispensable asociar un dominio mediante Amazon Route 53 y usar AWS Certificate Manager (ACM) para generar un certificado SSL/TLS gratuito que proteja los datos en tránsito. AWS WAF integrado con CloudFront o el ALB para bloquear ataques comunes bots maliciosos o ataques de denegación de servicio (DDoS).

### 

### Fiabilidad

**Decisiones tomadas:**

* Fargate distribuye automáticamente los contenedores en múltiples Zonas de Disponibilidad (Multi-AZ) detrás del ALB.
* ALB con health checks que sacan del pool las instancias que no responden

**Qué mejoraríamos:** Alta Disponibilidad Multi-Región: Activar DynamoDB Global Tables. Esto replica el catálogo de productos de forma activa-activa y en milisegundos a una segunda región.vSi una región falla, la otra absorbe el 100% del tráfico de inmediato.

### 

### Eficiencia de Rendimiento

**Decisiones tomadas:**

* Fargate para no gestionar servidores y escalar sin overhead operativo
* CloudFront cachea las consultas de lectura a nivel mundial.
* DynamoDB ofrece respuestas en milisegundos de un solo dígito.

**Qué mejoraríamos:** Caché de Base de Datos con DynamoDB Accelerator (DAX): reduce el tiempo de respuesta de DynamoDB de milisegundos a microsegundos cargando los datos en memoria.
Caché en el Edge con Amazon CloudFront: Configurar CloudFront frente al balanceador de carga (ALB) para cachear las respuestas de los endpoints GET /products y GET /products/{id}. Esto evita que las peticiones repetitivas lleguen a los contenedores, reduciendo drásticamente la latencia global y los costos.

### 

### Optimización de Costos

**Decisiones tomadas:**

* AWS Fargate y DynamoDB cobran exactamente por el uso real (Pay-as-you-go).
* No hay instancias EC2 cobrando 24/7 si no hay tráfico.

**Qué mejoraríamos:** Fargate Spot Instances configurar ECS para usar Fargate Spot en ambientes de desarrollo o para un porcentaje de las tareas de producción. AWS ofrece hasta un 70% de descuento en computación utilizando capacidad ociosa que puede ser interrumpida. DynamoDB Auto-scaling si el tráfico fluctúa de manera predecible según el horario, cambiar el modo de la base de datos de On-Demand a Provisioned con Auto-scaling suele ser más económico para cargas de trabajo estables a gran escala.

### 

### Sostenibilidad

**Decisiones tomadas:**

* el MVP utiliza servicios inherentemente eficientes como DynamoDB y AWS Fargate (Serverless)
* Fargate evita instancias EC2 ociosas: los recursos se usan solo cuando hay carga real

**Qué mejoraríamos:** Si el negocio lo permite, migra la infraestructura a regiones de AWS con menor intensidad de carbono y alto compromiso ecológico, como eu-west-1 (Irlanda) o us-west-2 (Oregón), en lugar de regiones con redes eléctricas más dependientes de combustibles fósiles. Contenedores un 60% más eficientes: Por defecto, los contenedores corren en procesadores con arquitectura tradicional x86 (Intel/AMD). AWS ofrece procesadores AWS Graviton basados en arquitectura ARM. Los procesadores Graviton ofrecen un rendimiento por vCPU sustancialmente mayor y consumen hasta un 60% menos de energía para la misma carga de trabajo. Una solución en una version mejorada seria cambiar el parámetro runtime\_platform en la definición de la tarea de ECS en IAC para usar ARM64, y compilar la imagen de Docker para esa misma arquitectura (linux/arm64). Mantener registros antiguos o imágenes de Docker en AWS ECR que nunca se van a usar requiere que los discos duros de AWS permanezcan encendidos y refrigerados las 24 horas, para mejorar esto configurar una política de ciclo de vida (Lifecycle Policy) en el repositorio de Amazon ECR para retener únicamente las últimas 5 o 10 imágenes Docker y eliminar automáticamente las versiones antiguas. Habilitar políticas de expiración en Amazon CloudWatch Logs para borrar logs de depuración (debug) pasados los 7 o 14 días.

