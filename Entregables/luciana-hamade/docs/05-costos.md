# 05 — Estimación y Optimización de Costos

Diseñar en la nube no solo implica elegir los mejores servicios que ofrezcan la mejor performance, sino también garantizar la *viabilidad/sustentabilidad* económica del proyecto. A continuación, se detalla el análisis de costos para la infraestructura de **Ghirba Travel**.

---

##  Componentes de Mayor Costo

En la arquitectura propuesta para producción, los servicios que representan el mayor porcentaje del presupuesto mensual son:

1. **Amazon RDS for PostgreSQL (Multi-AZ):**
   * **Por qué es costoso:** Al ejecutarse en dos Zonas de Disponibilidad (Multi-AZ) para garantizar redundancia y alta disponibilidad, se paga el equivalente a dos instancias de base de datos encendidas 24/7 más el almacenamiento provisionado y el tráfico de replicación.
2. **AWS Application Load Balancer (ALB):**
   * **Por qué es costoso:** Posee un costo fijo por hora de funcionamiento más un costo variable según las unidades de capacidad de balanceo de carga (*LCUs*) consumidas por el tráfico procesado.
3. **AWS Fargate (Backend ECS):**
   * **Por qué es costoso:** El costo se calcula por vCPU y memoria GB por hora utilizados por las tareas del contenedor.

---

## Decisiones Tomadas para Optimizar Costos

Para mantener un presupuesto eficiente y evitar gastos innecesarios, se aplicaron las siguientes estrategias:

* **Estrategia Serverless para Frontend (S3 + CloudFront):**
  * Servir la aplicación React desde **S3** con **CloudFront** reduce el costo de alojamiento del frontend a centavos de dólar al mes (solo se paga por el almacenamiento en GBs y la transferencia de datos de salida). Se evita el gasto fijo de mantener instancias EC2 encendidas para renderizar archivos estáticos.
* **Auto-Scaling en Backend (Fargate):**
  * Durante horarios de menor demanda , el cluster de Fargate reduce el número de tareas activas al mínimo necesario, evitando pagar por cómputo ocioso. 
* **Aprovechamiento de la Capa Gratuita (Free Tier) y Nubes Híbridas:**
  * Durante las etapas iniciales o de desarrollo, la base de datos se puede mantener en un servicio serverless como **Neon Tech** (PostgreSQL) bajo el plan gratuito, difiriendo el costo de Amazon RDS Multi-AZ únicamente para el entorno de producción consolidado.

---

## Simplificaciones para un MVP (Producto Mínimo Viable)

Si se necesitara desplegar una primera versión (*MVP*) o entorno de prueba con el mínimo costo posible, se tomarían las siguientes decisiones de simplificación:

1. **RDS Single-AZ o Neon PostgreSQL:** Desactivar la configuración Multi-AZ de RDS para reducir a la mitad el costo de la base de datos, o utilizar la capa gratuita de Neon PostgreSQL.
2. **Fargate Spot:** Utilizar la modalidad *Fargate Spot* para los contenedores de desarrollo, lo que ofrece un descuento de hasta el 70% sobre el precio de lista.
3. **Remover WAF en etapas iniciales:** Omitir la regla de AWS WAF temporalmente durante la etapa de pruebas, confiando en las reglas de seguridad nativas de las VPC (*Security Groups*).

---

## Estimación de Referencia (AWS Pricing Calculator)

Para un tráfico estimado de **2000 usuarios mensuales** navegando el catálogo y reservando viajes:

| Servicio AWS | Configuración Estimada | Costo Estimado Mensual (USD) |
| :--- | :--- | :--- |
| **Amazon S3 + CloudFront** | 10 GB Almacenamiento + 50 GB Data Transfer | ~$1.35 USD |
| **AWS Fargate (Backend)** | 1 Tarea (0.25 vCPU / 0.5 GB RAM) 24/7  | ~9.07 USD |
| **Amazon RDS PostgreSQL** | `db.t3g.micro` (Single-AZ para inicio / MVP) | ~$15.44 USD |
| **Application Load Balancer** | 1 ALB + Tráfico moderado | ~$16.90 USD |
| **AWS Secrets Manager** | 1 Secreto almacenado + peticiones | ~$0.40 USD |
| **TOTAL ESTIMADO (MVP):** | | **~$43.10 USD / mes** |

**Link de la estimación** : https://calculator.aws/#/estimate?id=dfefdad9265a711374ce9480588e84565e64e4b7

**Conclusión**

Elección de Región (us-east-1 - Virginia):

Se selecciona la región us-east-1 (N. Virginia) por ser la más económica, reduciendo entre un 30% y un 50% los costos operativos en comparación con sa-east-1 (São Paulo).

El impacto potencial de latencia geográfica se mitiga eficazmente mediante el uso de Amazon CloudFront, el cual almacena en caché y distribuye el frontend desde Puntos de Presencia (Edge Locations) locales, garantizando tiempos de respuesta inmediatos para el usuario final.