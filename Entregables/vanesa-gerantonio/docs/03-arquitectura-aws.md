# 03 — Arquitectura propuesta en AWS

## Objetivo

Publicar OrganiCloud de forma segura y evitar que el organigrama y la normativa dependan de una computadora o de archivos aislados.

## Servicios seleccionados y justificación

- **Route 53 + CloudFront + AWS WAF:** dominio, entrega segura y filtrado de solicitudes maliciosas.
- **Application Load Balancer:** entrada HTTPS y distribución entre dos zonas de disponibilidad.
- **Amazon ECS con Fargate:** ejecuta el mismo contenedor Docker sin administrar servidores. Lo prefiero frente a EC2 porque reduce la operación de instancias y frente a Elastic Beanstalk porque ofrece control directo del servicio contenerizado.
- **Amazon ECR:** almacena la imagen versionada de la aplicación.
- **Amazon RDS for PostgreSQL Multi-AZ:** conserva la estructura relacional y el historial con failover administrado. PostgreSQL es una tecnología que ya conozco y RDS reduce tareas de parches y backups.
- **Amazon S3:** almacena exportaciones Word, plantillas y evidencias con versionado. Es adecuado para objetos y permite recuperar versiones.
- **Amazon Cognito:** autenticación; grupos como consulta, editor y aprobador.
- **Secrets Manager + KMS:** credenciales fuera del código y cifrado.
- **CloudWatch:** logs, métricas y alarmas.
- **AWS Backup:** políticas centralizadas y copias cross-region para contingencia.

La aplicación se distribuye en dos AZ. No se incluyen contraseñas en la imagen; la comunicación pública usa HTTPS y la base queda en subredes privadas.
