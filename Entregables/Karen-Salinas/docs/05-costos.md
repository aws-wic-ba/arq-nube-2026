# 05 — Estimación de costos

## Servicios más costosos

| Servicio | Costo estimado/mes |
|----------|--------------------|
| AWS Lambda | ~3USD |
| Amazon S3 | ~0.0016USD | 
| Neon | ~$25USD | 
| Amazon SNS y SQS | ~0.10USD | 


**Total estimado:** ~$28.10/mes para una carga pequeña

## Decisiones de optimización tomadas

-Arquitectura asíncrona (SQS + SNS): Desacopla las compras y publicaciones para absorber picos de tráfico sin saturar la base de datos ni requerir servidores fijos sobredimensionados.

-Aprovechamiento del Free Tier: Maximiza la capa gratuita de AWS Lambda, CloudFront (1 TB para imágenes) durante el inicio.

## Lo que evitaríamos en una primera versión

-Evitar la infraestructura multi-región o clústeres de base de datos distribuidos: Para un lanzamiento enfocado exclusivamente en un mercado local (como Argentina), se descarta replicar bases de datos o servicios en múltiples regiones de AWS, simplificando la operación a una sola zona geográfica para reducir costos de transferencia y complejidad técnica.

## Herramienta recomendada

Usar la [AWS Pricing Calculator](https://calculator.aws/) para estimar costos con los valores reales de su arquitectura.
