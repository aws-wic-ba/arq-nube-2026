# 03 — Propuesta de Arquitectura en AWS

##  Visión General de la Infraestructura en la Nube

Para evolucionar la arquitectura local de **Ghirba Travel** hacia una solución en la nube altamente disponible, escalable y segura, se propone una infraestructura Serverless y de contenedores administrados sobre **Amazon Web Services (AWS)**.

---

##  Servicios de AWS Seleccionados y Justificación

### 1. Networking y Red Primaria
* **Amazon VPC (Virtual Private Cloud):**
  * **Uso:** Aislamiento de red para desplegar los recursos backend y bases de datos en subredes privadas.
  * **Justificación:** Garantiza que los componentes críticos de la app no estén expuestos directamente a Internet pública.
* **AWS Application Load Balancer (ALB):**
  * **Uso:** Punto de entrada único para el tráfico del backend.
  * **Justificación:** Distribuye las peticiones entrantes entre las múltiples réplicas de contenedores y realiza chequeos de estado (*healthchecks*) automáticos.

### 2. Cómputo y Frontend
* **Amazon S3 + Amazon CloudFront (Frontend):**
  * **Uso:** Hosting estático del frontend en React distribuido a través de una red de contenido (CDN).
  * **Justificación:** Los sitios estáticos servidos desde S3 y acelerados con CloudFront ofrecen un costo muy asequible, baja latencia para los usuarios y alta resistencia ante picos de tráfico.

* **AWS Fargate sobre Amazon ECS (Backend):**
  * **Uso:** Ejecución serverless de los contenedores Docker del backend (API Express).
  * **Justificación:** Permite abstraer la gestión de servidores EC2, ajustando los recursos (CPU/RAM) bajo demanda de forma automática (*Auto Scaling*) durante picos estacionales de la agencia.

  ####¿Por qué S3 + CloudFront y no EC2 para el Frontend? ####

Al estar construido con React, el frontend de Ghirba Travel se compila en un conjunto de archivos estáticos (HTML/JS/CSS). Servir estos archivos desde una máquina virtual EC2 implicaría pagar cómputo innecesario y asumir la complejidad de parchear el sistema operativo y gestionar escalado manual.

La combinación de *Amazon S3 + CloudFront* desacopla completamente el frontend del cómputo backend: ofrece una arquitectura Serverless de costo casi nulo en reposo, alta velocidad de carga distribuida globalmente por CDN y capacidad de absorber picos masivos de usuarios durante campañas comerciales sin degradar el servicio.

### 3. Persistencia de Datos
* **Amazon RDS for PostgreSQL:**
  * **Uso:** Migración o integración de la base de datos relacional a un servicio completamente administrado por AWS (Multi-AZ).
  * **Justificación:** Proporciona automatización de backups, parches de seguridad, alta disponibilidad en múltiples zonas de disponibilidad y escalabilidad de lectura mediante *Read Replicas*.

### 4. Seguridad, Secretos y Dominio
* **AWS Secrets Manager:**
  * **Uso:** Almacenamiento cifrado de las credenciales de la base de datos (`DATABASE_URL`), como por ejemplo el string de conexión.
  * **Justificación:** Evita el uso de variables de entorno estáticas o credenciales en texto plano dentro del código fuente.
* **AWS WAF (Web Application Firewall):**
  * **Uso:** Protección del Application Load Balancer y CloudFront ante ataques web comunes (SQL Injection, Cross-Site Scripting, bots).
* **AWS Certificate Manager (ACM):**
  * **Uso:** Aprovisionamiento y gestión automatizada de certificados SSL/TLS para el dominio de la agencia.
  * **Justificación:** Garantiza que todo el tráfico entre los usuarios, el CDN y el Load Balancer viaje cifrado mediante HTTPS sin costo adicional.  
* **AWS Key Management Service (KMS):**
  * **Uso:** Gestión centralizada y custodia de claves de cifrado para la base de datos (Amazon RDS), la caja fuerte de credenciales (AWS Secrets Manager) y control avanzado de llaves en Amazon S3.
  * **Justificación:** Otorga auditoría sobre el uso de claves de cifrado y garantiza que la información sensible en reposo cumpla con estándares de seguridad y protección de datos.  

  ### 5. Monitoreo y Observabilidad
* **Amazon CloudWatch:**
  * **Uso:** Recolección centralizada de métricas de rendimiento, registros de aplicación (*Logs*) y configuración de alarmas.
  * **Justificación:** Otorga visibilidad completa sobre el estado del backend en Fargate y la base de datos en RDS. Funciona como el disparador de las alarmas que gatillan las reglas de **Application Auto Scaling** en Fargate ante picos de uso de CPU/RAM o volumen de peticiones.

---

## Flujo de la Arquitectura Cloud

1. El cliente accede al frontend de la agencia alojado en **Amazon S3** a través del CDN **CloudFront**.
2. Las consultas y reservas hacia la API son dirigidas al **Application Load Balancer**.
3. El **ALB** balancea la carga hacia los contenedores de **Amazon ECS + Fargate** alojados en subredes privadas dentro de la **VPC**.
4. Los contenedores leen las credenciales seguras desde **AWS Secrets Manager** y persisten las transacciones en **Amazon RDS PostgreSQL**.