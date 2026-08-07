# 04 — AWS Well-Architected Framework

## Seguridad

Decisiones tomadas:

* Token de Jira en Secrets Manager, cifrado con KMS — nunca en el código ni en variables de entorno en texto plano
* Roles de IAM de mínimo privilegio: cada uno con permisos acotados al recurso puntual que necesita (nada de `Resource: "*"`)
* Lambda dentro de una VPC privada; el único tramo con salida a internet (la llamada a Jira) pasa por NAT Gateway, no queda expuesto directo
* El sistema nunca borra ni modifica accesos por su cuenta: los roles marcados van a un ticket de Jira para revisión humana (segregación de funciones)

En una siguiente fase: Agregaría WAF también frente al endpoint interno (hoy solo está delante de la API que consumiría el PAM en Fase 2), y habilitar GuardDuty para detección de amenazas sobre la cuenta.

## Fiabilidad

Decisiones tomadas:

* Dead Letter Queue (SQS): si la Lambda falla procesando un archivo, el evento no se pierde — queda para reprocesar
* S3 y DynamoDB son multi-AZ (Availability Zones) por default, sin configuración adicional de mi parte
* CloudWatch Alarms sobre error rate de la Lambda, con notificación a SNS

Se podría mejorar: hoy el diagrama simplifica Lambda como una sola caja dentro de "VPC Producción"; en una implementación real la pondría en subnets privadas replicadas en al menos 2 Availability Zones. También sumaría reintentos automáticos antes de mandar el evento a la DLQ, no solo dejarlo ahí esperando revisión manual.

## Excelencia Operativa

Decisiones tomadas:

* Logs centralizados en CloudWatch Logs, sin configuración extra (vienen incluidos al usar Lambda)
* Alarmas conectadas a un SNS Topic que notifica al equipo de seguridad — no dependo de que alguien mire los logs manualmente
* Infraestructura definida como código (Terraform), para poder recrear el ambiente sin pasos manuales

Qué mejoraría: agregar X-Ray para trazar cuánto tarda cada paso de una corrida (leer el JSON, llamar a Secrets Manager, llamar a Jira) y encontrar más rápido dónde está el cuello de botella si algo se pone lento.

## Optimización de Costos

Decisiones tomadas:

* Casi todo pago por uso: Lambda, DynamoDB, S3 — no hay ningún servidor prendido 24/7 esperando que llegue trabajo, que es la decisión de costos más importante de todo el diseño
* Separación de storage: los reportes pesados van a S3, en DynamoDB solo queda metadata liviana — evito pagar por duplicar el mismo dato en dos lugares
* La única excepción real es el NAT Gateway se cobra por hora esté o no procesando tráfico, más un cargo por GB — es el único recurso de toda la arquitectura que no escala a cero.

Qué mejoraría: agregar una S3 Lifecycle Policy para mover los reportes viejos a Glacier después de unos meses (siguen haciendo falta por auditoría, pero no a un costo de storage caro si nadie los consulta). También evaluaría si el NAT Gateway se justifica para este volumen o si conviene reemplazar la salida a Jira por otro mecanismo más barato (se me ocurren alternativas como comparar el costo con EC2 e instance NAT o el trade-off del lambda fuera de VPC).

## Eficiencia de Rendimiento

El volumen de datos es bajo — lotes de identidades, no tráfico constante — así que no hay hoy un problema de escala real. Lambda ya escala sola si en algún momento llegan archivos más grandes o corridas más frecuentes, sin que yo tenga que provisionar nada de antemano.

## Sostenibilidad 

Casi todo el diseño es serverless y escala a cero — la excepción es el NAT Gateway, que queda activo todo el tiempo aunque no haya tráfico pasando. Es un costo (y una huella) que pago igual, incluso en los momentos donde no hay ninguna corrida procesándose. Activaría el AWS Customer Carbon Footprint Tool para medir el impacto real en vez de asumirlo.
