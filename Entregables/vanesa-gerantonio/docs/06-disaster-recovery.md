# 06 — Disaster Recovery

## Objetivos

- Fallo de tarea o zona: **RTO 15 minutos**, **RPO 5 minutos**.
- Pérdida completa de región: **RTO 4 horas**, **RPO 1 hora**.

## Estrategia

En la región principal se usan tareas en dos AZ, RDS Multi-AZ, backups automáticos con point-in-time recovery y S3 Versioning. Para desastre regional se aplica **Backup and Restore**: AWS Backup copia snapshots a una segunda región y S3 replica exportaciones críticas.

## Recuperación

1. Declarar el incidente y congelar cambios.
2. Confirmar si el problema es de aplicación, base, AZ o región.
3. Reemplazar tareas desde ECR; si falla RDS, promover el standby.
4. En desastre regional, restaurar RDS y objetos, desplegar ECS y cambiar DNS.
5. Probar `/health`, inicio de sesión, organigrama, edición, historial y exportación.
6. Reabrir el servicio, documentar tiempos reales y ejecutar análisis posterior.

Se realizará un simulacro semestral. Un backup no se considera válido hasta demostrar que puede restaurarse.
