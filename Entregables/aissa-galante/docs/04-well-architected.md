# AWS Well-Architected Framework

## Introducción

La arquitectura propuesta fue diseñada siguiendo las recomendaciones del AWS Well-Architected Framework, priorizando una solución serverless, escalable y basada en servicios administrados.

## Excelencia Operacional

La solución utiliza servicios administrados como AWS Lambda, Amazon EventBridge y AWS Glue, reduciendo las tareas operativas y permitiendo automatizar la ejecución del pipeline de procesamiento.

Amazon CloudWatch centraliza métricas y registros para facilitar el monitoreo y la detección de incidentes.

## Seguridad

El acceso a los recursos se controla mediante AWS IAM.

Las credenciales de acceso a servicios externos se almacenan en AWS Secrets Manager, mientras que AWS KMS protege la información mediante cifrado.

AWS CloudTrail registra las acciones realizadas sobre la infraestructura para fines de auditoría.

## Fiabilidad

Amazon SQS desacopla la ingesta del procesamiento, evitando la pérdida de solicitudes durante picos de carga.

Amazon S3 ofrece almacenamiento altamente duradero para los datos históricos y Amazon DynamoDB proporciona alta disponibilidad para la información operativa.

## Eficiencia del Rendimiento

La arquitectura utiliza servicios serverless que escalan automáticamente según la demanda.

AWS Glue transforma los datos al formato Parquet particionado por fecha, permitiendo que Amazon Athena consulte únicamente la información necesaria y reduzca los tiempos de análisis.

## Optimización de Costos

La solución utiliza servicios bajo demanda, evitando mantener servidores en ejecución permanente.

AWS Lambda, Amazon EventBridge, Amazon Athena y Amazon SNS generan costos únicamente cuando son utilizados, permitiendo optimizar el consumo de recursos.

## Sostenibilidad

El uso de servicios administrados y serverless reduce el consumo innecesario de infraestructura, ya que los recursos se asignan únicamente cuando existe procesamiento, contribuyendo a un uso más eficiente de la capacidad del centro de datos.