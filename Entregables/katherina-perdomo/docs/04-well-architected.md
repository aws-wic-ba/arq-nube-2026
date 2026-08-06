# 04 — AWS Well-Architected Framework

## Excelencia Operativa

### Decisiones tomadas

- Monitoreo de la infraestructura mediante **Amazon CloudWatch**.
- Notificaciones automáticas utilizando **Amazon SNS** cuando se detectan eventos críticos.
- Arquitectura documentada para facilitar futuras tareas de mantenimiento y despliegue.

### Qué mejoraríamos

- Automatizar los despliegues mediante **GitHub Actions**.
- Incorporar dashboards personalizados para visualizar el estado de la aplicación.
- Documentar procedimientos de recuperación ante incidentes frecuentes (runbooks).

---

## Seguridad

### Decisiones tomadas

- Credenciales de la aplicación almacenadas de forma segura mediante **AWS Secrets Manager**.
- Gestión de permisos utilizando **AWS IAM**, aplicando el principio de mínimo privilegio.
- Acceso restringido mediante **Security Groups**, permitiendo únicamente el tráfico necesario.
- La base de datos se encuentra aislada y protegida del acceso directo desde Internet.

### Qué mejoraríamos

- Implementar autenticación por roles (odontólogo, recepcionista y paciente).
- Incorporar autenticación multifactor (MFA) para los administradores.
- Publicar la aplicación mediante **HTTPS** utilizando certificados administrados por AWS.

---

## Fiabilidad

### Decisiones tomadas

- La información se almacena en **Amazon RDS PostgreSQL Multi-AZ**, permitiendo recuperación automática ante fallos.
- Se diseñó la aplicación considerando la continuidad del servicio para el consultorio.
- La agenda incorpora un sistema de **notas rápidas** que permite continuar trabajando temporalmente ante inconvenientes.

### Qué mejoraríamos

- Incorporar **Application Load Balancer (ALB)** para distribuir el tráfico.
- Implementar **Auto Scaling** para aumentar la disponibilidad ante mayor cantidad de usuarios.
- Realizar pruebas periódicas del plan de recuperación.

---

## Eficiencia de Rendimiento

### Decisiones tomadas

- La aplicación se ejecuta sobre una única instancia **Amazon EC2**, suficiente para la carga esperada del consultorio.
- Los archivos clínicos se almacenan en **Amazon S3**, evitando sobrecargar la base de datos.
- La base de datos utiliza **PostgreSQL**, optimizando el almacenamiento de información relacional.

### Qué mejoraríamos

- Implementar mecanismos de caché para reducir consultas repetitivas.
- Incorporar Auto Scaling cuando aumente la demanda.
- Optimizar el rendimiento mediante monitoreo continuo de métricas.

---

## Optimización de Costos

### Decisiones tomadas

- Se seleccionó una única instancia **Amazon EC2**, adecuada para el tamaño actual del proyecto.
- Se utilizan únicamente los servicios necesarios, evitando infraestructura sobredimensionada.
- Amazon S3 permite almacenar archivos de forma económica y escalable.

### Qué mejoraríamos

- Revisar periódicamente el consumo utilizando AWS Cost Explorer.
- Ajustar el tamaño de las instancias según el crecimiento del sistema.
- Automatizar el apagado de recursos de prueba cuando no se encuentren en uso.

---

## Sostenibilidad

### Decisiones tomadas

- La arquitectura fue diseñada utilizando únicamente los recursos necesarios para el funcionamiento del consultorio.
- Se evita mantener infraestructura innecesaria o recursos ociosos.
- La solución puede crecer gradualmente sin necesidad de rediseñar completamente la arquitectura.

### Qué mejoraríamos

- Incorporar Auto Scaling para consumir recursos únicamente cuando exista demanda.
- Optimizar continuamente la infraestructura para reducir el consumo energético asociado al uso de recursos cloud.