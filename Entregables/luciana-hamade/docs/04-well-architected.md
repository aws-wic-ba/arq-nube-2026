# 04 — Evaluación del Well-Architected Framework

El **AWS Well-Architected Framework** proporciona un conjunto de principios y mejores prácticas para diseñar infraestructura en la nube confiable, segura, eficiente y rentable. A continuación, se analiza cómo se aplican estos pilares a la arquitectura de **Ghirba Travel**.

---

##  1. Pilar de Seguridad

El objetivo es proteger la información del catálogo, las transacciones de los usuarios y las credenciales del sistema.

### Decisiones tomadas:
* **Aislamiento de Red:** El backend (ECS Fargate) y la base de datos (RDS PostgreSQL) se alojan en subredes privadas dentro de una VPC. No son accesibles directamente desde Internet.
* **Gestión de Secretos:** La cadena de conexión a la base de datos (`DATABASE_URL`) y credenciales sensibles se almacenan de forma cifrada en **AWS Secrets Manager**, evitando exponer claves en texto plano en el repositorio o en las variables de entorno.
* **Cifrado en Tránsito y Reposo:** 
  * Todo el tráfico web (Frontend y API) utiliza **HTTPS/TLS** gestionado por **AWS Certificate Manager (ACM)**.
  * La base de datos RDS utiliza cifrado de almacenamiento en reposo mediante **AWS Key Management Service (KMS)**.
* **Protección perimetral:** Implementación de **AWS Web Application Firewall (WAF)** frente a CloudFront y el ALB para bloquear ataques comunes como SQL Injection o Cross-Site Scripting en los formularios de reserva.

### Oportunidades de mejora a futuro:
* Implementar **AWS IAM Roles** para profundizar  aún más en la aplicación el principio de menor privilegio en los contenedores de ECS.

---

## 2. Pilar de Eficiencia del Rendimiento

El objetivo es asegurar que la plataforma responda con baja latencia durante la navegación del catálogo y el procesamiento de reservas.

### Decisiones tomadas:
* **Descarga del Cómputo Frontend:** Al alojar los activos estáticos de React en **Amazon S3** y servirlos mediante **Amazon CloudFront**, las imágenes y el código de la app se entregan desde *Edge Locations* cercanas al usuario, minimizando los tiempos de carga.
* **Auto-Scaling en Backend:** **AWS Fargate** permite escalar horizontalmente los contenedores de Node.js/Express en función de la demanda (uso de CPU/RAM o cantidad de peticiones concurrentes).
* **Base de Datos Optimizada:** PostgreSQL relacional administrado para manejar consultas rápidas de disponibilidad y precios.

### Oportunidades de mejora a futuro:
* Implementar **Amazon ElastiCache (Redis)** para almacenar en caché las consultas de los destinos más buscados, reduciendo las lecturas directas a la base de datos durante eventos de alto tráfico (como HotSale o CyberMonday).

**Amazon CloudFront** y **Amazon ElastiCache** operan de forma complementaria: **CloudFront** optimiza la entrega de archivos estáticos e imágenes directamente en ubicaciones borde (Edge Locations) cerca del usuario, mientras que **ElastiCache** optimiza la capa de aplicación liberando de carga a la base de datos **PostgreSQL** mediante el almacenamiento en memoria RAM de las respuestas de la API.

---

## 3. Pilar de Fiabilidad (Reliability)

El objetivo es garantizar que la app permanezca operativa ante fallos de hardware o picos inesperados de demanda.

### Decisiones tomadas:
* **Despliegue Multi-AZ:**
  * El **Application Load Balancer (ALB)** distribuye el tráfico entre tareas de Fargate ejecutadas en múltiples zonas de disponibilidad (*Availability Zones*).
  * **Amazon Relational Database (RDS)** configurado en modo *Multi-AZ* con una réplica en standby sincrónica que asume el servicio automáticamente ante caídas en la zona primaria.
* **Desacople de Capas:** Si el backend o la base de datos experimentan una interrupción temporal, el frontend estático servido desde CloudFront sigue respondiendo y mostrando la interfaz al usuario, evitando páginas de error insalvables.

### Oportunidades de mejora a futuro:
* Configurar una cola de mensajes con **Amazon Simple Queue Service (SQS)** para que se genere una cola con las solicitudes de reserva durante caídas del backend, asegurando que ninguna reserva se pierda.

---

##  4. Pilar de Optimización de Costos

El objetivo es evitar gastos innecesarios y pagar únicamente por los recursos consumidos. Además, de optar por la alternativa que implique menores costos sin sacrificar rendimiento.

### Decisiones tomadas:
* **Hosting Serverless para Frontend:** Usar S3 + CloudFront para el código de React reduce el costo a centavos de dólar al mes en comparación con mantener servidores virtuales EC2 encendidos 24/7.
* **Cómputo Serverless bajo Demanda:** **AWS Fargate** cobra de forma granular por los segundos de cómputo (vCPU y RAM) utilizados por los contenedores, eliminando la capacidad ociosa cuando la demanda baja.

### Oportunidades de mejora a futuro:
* Adoptar **AWS Savings Plans** o **Fargate Spot Instances** para entornos de desarrollo y staging, reduciendo el costo de cómputo en hasta un 50-70%.

---

##  5. Pilar de Excelencia Operativa

El objetivo es simplificar el mantenimiento, despliegue y monitoreo de la plataforma.

### Decisiones tomadas:
* **Containerización:** La app está empaquetada en contenedores Docker.
* **Monitoreo Centralizado:** **Amazon CloudWatch** recolecta métricas de rendimiento, errores de la API en Node.js y la salud de la base de datos.

## 🌿 6. Pilar de Sostenibilidad

El objetivo es minimizar el impacto ambiental y la huella de carbono mediante la reducción del consumo energético y la optimización de recursos ociosos.

### Decisiones tomadas:
* **Reducción de Recursos Ociosos (Serverless & Auto-Scaling):** La combinación de **Amazon S3**, **CloudFront** y **AWS Fargate** asegura que solo se consuma energía de cómputo y almacenamiento cuando hay demanda real de los usuarios, evitando servidores virtuales encendidos innecesariamente durante horas valle.
* **Caché en el Borde (CDN):** Servir las imágenes y el contenido estático a través de **CloudFront** disminuye la distancia física del viaje de los datos, reduciendo el consumo energético de la infraestructura de red global.

### Oportunidades de mejora a futuro:
* Configurar políticas de ciclo de vida (*Lifecycle Rules*) en Amazon S3 para mover archivos antiguos o imágenes en desuso a clases de almacenamiento de menor consumo energético como **S3 Glacier Flexible Retrieval**.