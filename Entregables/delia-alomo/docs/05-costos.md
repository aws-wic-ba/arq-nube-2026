# 05 - Estimación de costos

## Supuestos de uso

Para estimar costos se asumió un escenario realista para la etapa actual del proyecto: una app educativa, sin campaña de marketing activa, con un uso bajo pero creciente.

- ~500 usuarios activos por mes
- ~5 peticiones al backend por usuario (test de orientación, guardar progreso, consultar roadmap)
- ~2.500 invocaciones de Lambda / mes
- ~1 GB de contenido estático (frontend) servido vía CloudFront
- Tabla de DynamoDB en modo on-demand (no provisioned), acorde a un tráfico bajo e irregular

Estos números se usaron como referencia en la AWS Pricing Calculator; no son una factura real, sino un orden de magnitud para tomar decisiones de diseño.

## Servicios más costosos de la arquitectura

En una arquitectura serverless con este volumen de uso, ningún servicio individual representa un costo significativo, pero en orden de relevancia:

1. **Amazon CloudFront**: es el que más tráfico mueve (sirve el frontend completo a cada visita), aunque el costo por GB transferido es bajo a esta escala.
2. **AWS Lambda**: el costo depende de la cantidad de invocaciones y el tiempo de ejecución; a 2.500 invocaciones/mes está muy por debajo del free tier (1 millón gratis por mes).
3. **Amazon DynamoDB**: en modo on-demand, se paga por lectura/escritura real; con este volumen el costo es marginal.
4. **Amazon Cognito**: el free tier cubre hasta 10.000 usuarios activos mensuales (MAU), por lo que a esta escala el costo es prácticamente nulo.
5. **Amazon S3 y API Gateway**: costos residuales, no representan una porción relevante del total.

**Conclusión:** a la escala actual del proyecto, la arquitectura completa entra casi en su totalidad dentro de las capas gratuitas de AWS (Free Tier), lo cual valida la elección de un modelo serverless para esta etapa.

## Decisiones tomadas para optimizar costos

- **DynamoDB on-demand en lugar de provisioned**: al no conocer el patrón de tráfico con certeza, on-demand evita pagar por capacidad reservada que no se usa.
- **Lambda en lugar de un servidor siempre activo**: es la decisión de costos más importante de toda la arquitectura. Con tráfico bajo, un servidor EC2 factura 24/7 sin importar el uso real.
- **CloudFront con cacheo agresivo del frontend**: al ser contenido estático que solo cambia con cada deploy, se puede configurar un TTL largo, reduciendo peticiones repetidas al origen.
- **Cognito en el tier gratuito**: para un proyecto en esta etapa, no se justifica ningún feature paga de Cognito; el tier gratuito cubre ampliamente las necesidades actuales.

## Qué evitaría o simplificaría en una primera versión

- **CloudWatch Alarms y dashboards personalizados**: con el volumen actual, revisar los logs manualmente de forma ocasional es suficiente.
- **DynamoDB Global Tables**: es una función pensada para aplicaciones con usuarios distribuidos globalmente; para esta etapa sería sobre-ingeniería.
- **AWS WAF**: es una capa de seguridad valiosa, pero tiene un costo mensual fijo que no se justifica hasta que la app tenga tráfico real expuesto a riesgo de ataques.

La idea general es: la arquitectura serverless ya es, en sí misma, la decisión de optimización de costos más importante — el resto son ajustes finos que se activarían a medida que el proyecto crezca, no desde el día uno.
