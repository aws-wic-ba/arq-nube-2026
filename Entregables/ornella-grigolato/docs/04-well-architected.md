# AWS Well-Architected Framework

En el diseño e implementación de esta plataforma SaaS, se han aplicado los principios del AWS Well-Architected Framework.

## 1. Excelencia Operativa

**Decisión tomada:**
Para este MVP se adoptó un enfoque de despliegue híbrido, priorizando la velocidad de iteración. La capa de cómputo y ruteo (AWS Lambda y API Gateway) se gestiona mediante Infraestructura como Código (IaC) utilizando _Serverless Framework_, lo que agiliza los despliegues de lógica. Sin embargo, los recursos de estado, almacenamiento e identidad (Amazon DynamoDB, S3 y Cognito) fueron provisionados manualmente desde la consola de AWS (ClickOps). Por el lado del cliente, el frontend se estandarizó mediante contenedores (Docker) para garantizar la paridad del entorno de desarrollo local.

**Qué mejoraría con más tiempo/presupuesto:**
El principal objetivo a corto plazo para alcanzar la excelencia operativa es erradicar la creación manual de recursos. Migraría la definición de Cognito, DynamoDB y S3 al bloque `resources` del `serverless.yml` para unificar toda la infraestructura bajo un único esquema IaC. Además, implementaría un pipeline de integración y despliegue continuo (CI/CD) en AWS CodePipeline para automatizar los testeos y subidas a producción sin intervención manual.

## 2. Seguridad

**Decisión tomada:**
La protección de la API está delegada a Amazon Cognito. Se configuró un _Cognito Authorizer_ en API Gateway, asegurando que las funciones Lambda solo se invoquen si la petición cuenta con un token JWT válido. A nivel de infraestructura, se aplicó el principio de "mínimos privilegios": cada Lambda tiene un rol de IAM específico que le permite únicamente leer/escribir en su tabla correspondiente de DynamoDB.

**Qué mejoraría con más tiempo/presupuesto:**
Agregaría AWS WAF (Web Application Firewall) delante de API Gateway para proteger contra ataques comunes (como inyección SQL o cross-site scripting). También, migraría la gestión de secretos (en caso de sumar integraciones de terceros) a AWS Secrets Manager.

## 3. Fiabilidad

**Decisión tomada:**
Al utilizar exclusivamente servicios gestionados (_Managed Services_) como API Gateway, Lambda y DynamoDB, la arquitectura hereda la alta disponibilidad nativa de AWS.

**Qué mejoraría con más tiempo/presupuesto:**
Activaría backups automáticos en las tablas de DynamoDB para prevenir la pérdida de datos ante borrados accidentales. También implementaría _Dead-Letter Queues_ (DLQ) con Amazon SQS para atajar y reintentar ejecuciones asíncronas fallidas en las Lambdas.

## 4. Eficiencia de Rendimiento

**Decisión tomada:**
La naturaleza _event-driven_ de AWS Lambda asegura que la capacidad de cómputo escale de forma automática y paralela en respuesta a la demanda exacta, sin cuellos de botella por servidores saturados. DynamoDB proporciona latencias de lectura/escritura de un solo dígito de milisegundo a cualquier escala.

**Qué mejoraría con más tiempo/presupuesto:**
Si el SaaS crece en volumen de lectura, sumaría DynamoDB Accelerator (DAX) para cacheo en memoria.

## 5. Optimización de Costos

**Decisión tomada:**
Se optó por una arquitectura 100% _Serverless_ bajo el modelo de precios _Pay-as-you-go_ (Pago por uso). A diferencia de tener instancias EC2 o contenedores encendidos 24/7 (que generan gastos fijos independientemente del uso), esta arquitectura genera un costo de cero dólares ($0.00) cuando no hay tráfico, aprovechando fuertemente la Capa Gratuita (_Free Tier_) de AWS.

**Qué mejoraría con más tiempo/presupuesto:**
Utilizaría la herramienta AWS Compute Optimizer para analizar el consumo de memoria de las Lambdas a lo largo del tiempo y ajustar la asignación de RAM exacta que brinde el mejor equilibrio entre costo y tiempo de ejecución.

## 6. Sostenibilidad

**Decisión tomada:**
El modelo sin servidor reduce drásticamente los recursos ociosos. Al no tener servidores aprovisionados de forma permanente esperando tráfico, se minimiza la huella de carbono asociada al consumo eléctrico y refrigeración de centros de datos de recursos infrautilizados.

**Qué mejoraría con más tiempo/presupuesto:**
Migraría el entorno de ejecución (_runtime_) de las funciones Lambda de la arquitectura x86 a procesadores AWS Graviton (ARM64). Los procesadores Graviton ofrecen un mejor rendimiento por vatio de energía consumido, lo que se traduce en una arquitectura más sustentable y, adicionalmente, más económica.
