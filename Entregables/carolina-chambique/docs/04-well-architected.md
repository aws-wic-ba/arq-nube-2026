# 04 — Evaluación Well-Architected

Para evaluar CloudDesk tomé como referencia los seis pilares del AWS Well-Architected Framework. Mi prioridad principal es proteger los documentos y mantener disponible la aplicación, pero teniendo en cuenta que inicialmente está pensada para estudiantes y equipos pequeños.

## Excelencia operativa

### Decisión

Utilizaría Amazon CloudWatch para centralizar los logs y métricas de CloudDesk. Configuraría alarmas para detectar errores HTTP 5xx, tareas de ECS que no respondan, uso elevado de recursos, poco espacio en RDS y fallas en los backups.

ECS realizaría healthchecks para detectar y reemplazar automáticamente un contenedor que deje de funcionar.

### Qué mejoraría

Con más tiempo implementaría la infraestructura como código y un pipeline que ejecute pruebas antes de publicar una nueva imagen Docker. También documentaría los procedimientos para restaurar backups y revertir despliegues.

## Seguridad

### Decisión

Los archivos pueden incluir trabajos universitarios o información de proyectos, por lo que no deberían ser públicos.

Utilizaría:

- Amazon Cognito para autenticar usuarios.
- S3 con el acceso público bloqueado.
- AWS KMS para cifrar datos.
- Secrets Manager para almacenar la contraseña de PostgreSQL.
- RDS dentro de una subred privada.
- IAM con permisos mínimos.
- HTTPS para las conexiones.
- CloudTrail para registrar cambios administrativos.

### Qué mejoraría

En una futura versión agregaría autenticación multifactor, permisos por grupos y análisis de archivos para detectar malware antes de permitir su descarga.

## Fiabilidad

### Decisión

La pérdida de mis archivos universitarios fue uno de los motivos por los que elegí desarrollar CloudDesk. Por eso la recuperación de información es una parte importante de la arquitectura.

Para producción utilizaría:

- Tareas ECS distribuidas entre dos zonas de disponibilidad.
- Application Load Balancer con healthchecks.
- Amazon RDS Multi-AZ.
- Versionado en Amazon S3.
- Backups automáticos de RDS.
- Copias en otra región para desastres importantes.

Si un contenedor deja de funcionar, ECS puede reemplazarlo. Si falla una zona, el Load Balancer puede dirigir las solicitudes a otra tarea y RDS puede realizar un failover.

### Qué mejoraría

Realizaría pruebas periódicas de restauración. No consideraría que un backup es confiable hasta comprobar que realmente puede recuperarse.

## Eficiencia de rendimiento

### Decisión

Los archivos se guardarían en S3 y PostgreSQL solamente almacenaría sus metadatos. Esto evita sobrecargar la base de datos con archivos grandes.

ECS Fargate podría aumentar la cantidad de tareas cuando crezca el número de usuarios. CloudFront podría mejorar las descargas para usuarios ubicados en diferentes lugares.

### Qué mejoraría

Antes de aumentar recursos revisaría métricas reales. También agregaría índices en PostgreSQL si las búsquedas comenzaran a ser lentas.

## Optimización de costos

### Decisión

Aunque mi prioridad es mantener disponible la aplicación, CloudDesk comienza como un proyecto universitario con pocos usuarios.

Para controlar los costos:

- Desarrollo podría utilizar una sola tarea ECS.
- RDS podría usar Single-AZ fuera de producción.
- Los archivos antiguos podrían pasar a clases S3 más económicas.
- Los logs tendrían una retención limitada.
- ECR eliminaría imágenes antiguas.
- AWS Budgets enviaría alertas de gasto.
- Fargate y RDS se ajustarían según el consumo real.

En producción mantendría RDS Multi-AZ porque la disponibilidad de los metadatos es más importante que el ahorro de usar una sola instancia.

### Qué mejoraría

Si el consumo se volviera estable, evaluaría Savings Plans. También revisaría recursos sin uso y snapshots antiguos.

## Sostenibilidad

### Decisión

Fargate permite utilizar recursos según la demanda sin mantener servidores sobredimensionados. La imagen Docker utiliza una versión reducida de Python.

Las políticas de S3, ECR y CloudWatch evitarían conservar indefinidamente archivos, imágenes y logs innecesarios.

### Qué mejoraría

Revisaría periódicamente el uso de CPU, memoria y almacenamiento. Reduciría los recursos ociosos y eliminaría información sólo cuando se cumpla la política de retención acordada.
