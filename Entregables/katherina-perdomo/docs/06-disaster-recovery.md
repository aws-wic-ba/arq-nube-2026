# 06 — Plan de Recuperación ante Desastres (Disaster Recovery)

## Usuarios y disponibilidad

| Aspecto | Decisión |
|---------|----------|
| **Usuarios** | Actualmente la aplicación está dirigida a la odontóloga. En futuras versiones podrán acceder recepcionistas y pacientes mediante distintos perfiles de usuario. |
| **Horario de uso** | Principalmente de lunes a viernes durante el horario de atención del consultorio. |
| **Mantenimiento** | Se realizará preferentemente fuera del horario laboral para minimizar el impacto sobre los usuarios. |
| **Impacto de una caída** | La odontóloga no podrá consultar la agenda, acceder a la información de los pacientes ni registrar nuevos turnos, afectando la atención diaria del consultorio. |

---

## Riesgos identificados

| Riesgo | Probabilidad | Mitigación |
|---------|:------------:|------------|
| Caída de la instancia Amazon EC2 | Media | Restaurar la aplicación utilizando la imagen Docker en una nueva instancia. |
| Falla de la base de datos | Baja | Amazon RDS PostgreSQL Multi-AZ realiza recuperación automática ante fallos. |
| Eliminación accidental de archivos | Baja | Almacenamiento y respaldo de documentos en Amazon S3. |
| Error humano | Media | Backups periódicos y aplicación del principio de mínimo privilegio mediante AWS IAM. |

---

## Recuperación ante desastres

| Aspecto | Decisión |
|---------|----------|
| **Estrategia** | **Backup & Restore**, complementada con Amazon RDS PostgreSQL Multi-AZ para garantizar la disponibilidad de la base de datos. |
| **Backups** | Amazon RDS realizará respaldos automáticos de la base de datos. Además, se efectuará un respaldo periódico de la información del consultorio, preferentemente durante los fines de semana cuando no exista atención al público. |
| **RTO (Recovery Time Objective)** | Hasta **1 hora**, considerando el tiempo necesario para restaurar la aplicación o reconstruir la infraestructura. |
| **RPO (Recovery Point Objective)** | Hasta **15 minutos**, aprovechando los mecanismos de respaldo y recuperación de Amazon RDS. |

---

## Procedimiento de recuperación

Ante una falla de la infraestructura se seguirá el siguiente procedimiento:

1. Identificar el incidente mediante Amazon CloudWatch y las alertas enviadas por Amazon SNS.
2. Restaurar la instancia Amazon EC2 utilizando la imagen Docker de la aplicación.
3. Recuperar la base de datos desde Amazon RDS si fuera necesario.
4. Verificar el correcto funcionamiento de la aplicación antes de restablecer el servicio.
5. Confirmar la disponibilidad para los usuarios.

---

## Mejoras futuras

- Automatizar la recuperación de la infraestructura mediante **Infrastructure as Code (IaC)**.
- Incorporar múltiples instancias Amazon EC2 detrás de un **Application Load Balancer (ALB)**.
- Implementar replicación entre regiones para escenarios de desastre de mayor impacto.
- Realizar pruebas periódicas del plan de recuperación.
- Verificar regularmente la restauración de los backups para garantizar su correcto funcionamiento.