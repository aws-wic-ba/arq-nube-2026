Seguridad

Cadena de entrada sin bypass y cadena de confianza entre componentes: CloudFront → ALB → Fargate → RDS, con cada salto restringido mediante grupos de seguridad. Secretos en Secrets Manager + KMS; cifrado en reposo; auditoría con CloudTrail; mínimo privilegio.

Fiabilidad y disponibilidad

Ante falla de una AZ, las tareas de Fargate distribuidas en la otra AZ siguen atendiendo vía el ALB y RDS hace failover a la standby. NAT por AZ evita un único punto en la salida. (Alta disponibilidad ≠ DR: esto cubre la falla de una zona, no de la región.)

Eficiencia de rendimiento (elasticidad)

El tráfico es variable, por lo que mantener la capacidad máxima permanentemente sería innecesario. Se configura Auto Scaling por CPU promedio, con un mínimo de 2 tareas (una por AZ) y un máximo de 6, definido como un límite de capacidad y costo para el alcance esperado de la aplicación. CloudWatch mide, Auto Scaling ajusta la cantidad de tareas, el ALB distribuye el tráfico y CloudFront cachea el contenido estático.

Excelencia operativa

CloudWatch (métricas, logs y alarmas) + SNS (alertas por mail). CI/CD y Trusted Advisor quedan como mejoras futuras.

Optimización de costos

Ver documento 05.

Sostenibilidad

Auto scaling evita capacidad ociosa; Lifecycle evita acumular datos en almacenamiento caro.
