# Estimación y Optimización de Costos (AWS)

El diseño de esta arquitectura se basó fuertemente en la optimización financiera, aprovechando al máximo la Capa Gratuita (_Free Tier_) de AWS y el modelo de precios de pago por uso (_Pay-as-you-go_).

## 1. Servicios más costosos de la arquitectura a escala

Dado que la arquitectura es 100% Serverless, no existen costos fijos de servidores encendidos. Sin embargo, a medida que el SaaS escale, los costos se concentrarán en:

- **Amazon API Gateway:** Es el servicio que escala su costo de manera más directa con el tráfico, cobrando por cada millón de peticiones HTTP procesadas.
- **Amazon Cognito:** Aunque tiene una capa gratuita extremadamente generosa (50.000 usuarios activos mensuales), una vez superado ese umbral, el costo por MAU (Monthly Active User) se convierte en un factor importante.

## 2. Decisiones tomadas para optimizar costos

- **Escalado a Cero:** Se descartó el uso de contenedores en ECS o instancias EC2 para el backend. Al usar AWS Lambda, cuando no hay usuarios navegando por las _landing pages_ de los refugios, el costo de cómputo del backend es exactamente $0.00.
- **DynamoDB en modo _On-Demand_:** En lugar de aprovisionar capacidad de lectura/escritura por adelantado (lo cual genera un costo fijo mensual), se configuró la base de datos bajo demanda. Solo se paga por las lecturas y escrituras que efectivamente ocurren.
- **Alojamiento de estáticos:** El frontend compilado se aloja y distribuye mediante AWS Amplify/S3, cuyo costo de almacenamiento y transferencia de red (CDN) son fracciones de centavo por Gigabyte, siendo inmensamente más barato que servir la web desde un servidor Node.js.

## 3. Qué evitarías o simplificarías en una primera versión (MVP)

Para mantener los costos iniciales al mínimo, en este MVP se evitaron activamente las siguientes arquitecturas:

- **Bases de Datos Relacionales (Amazon RDS):** Usar PostgreSQL o MySQL administrado implica levantar una instancia que cobra por hora. DynamoDB elimina este problema de raíz.
- **Lambdas dentro de una VPC (Virtual Private Cloud):** Si no hay recursos que requieran estricta privacidad de red (como una base de datos RDS), meter las Lambdas en una VPC es innecesario. Hacerlo podría requerir un _NAT Gateway_ para que las Lambdas tengan salida a internet, introduciendo un costo fijo alto.
- **Provisioned Concurrency en Lambda:** En una primera versión, es preferible tolerar el _Cold Start_ (arranque en frío) de unos milisegundos en la primera petición, antes que pagar por mantener Lambdas calientes y listas (lo que rompe la regla del costo cero).

## 4. Estimación Mensual (AWS Pricing Calculator)

Considerando un escenario de adopción inicial del SaaS para el primer año, con el siguiente tráfico mensual estimado:

- **10.000** usuarios activos mensuales (MAUs).
- **1.000.000** de peticiones a la API.
- **1 GB** de almacenamiento en DynamoDB.

**Proyección de Costos (Estimado):**

- **Amazon Cognito:** 10,000 MAUs (cubierto por el Free Tier de 50k) = **$0.00**
- **AWS Lambda:** 1M de peticiones, 512MB RAM, 200ms de duración promedio (cubierto por el Free Tier mensual) = **$0.00**
- **Amazon API Gateway:** 1M peticiones HTTP API (cubierto por el Free Tier o ~$1.00 sin Free Tier) = **$0.00**
- **Amazon DynamoDB:** 1 GB de almacenamiento y tráfico _on-demand_ = **< $1.00**

**Costo Total Estimado para el MVP:** **~$1.00 USD / mes.**
_(La arquitectura es financieramente libre de riesgos para la etapa de validación comercial del SaaS)._
