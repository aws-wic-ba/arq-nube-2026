# 06 — Plan de recuperación ante desastres

## Assumptions
- La app la usa el público general (sin autenticación, usuarios anónimos). 
- No hay una franja "sin usuarios" tan clara como otras apps (los usuarios ingresan fuera de horario de oficina/fines de semana o cuando están por viajar). 
- Posible ventana de mantenimiento por la madrugada.
- El impacto de la caída de la app es bajo (no procesa pagos ni reservas). 
- Si la app se cae, el usuario puede consultar en otro momento (justifica la estrategia elegida Backup and Restore).
- No aloja datos sensibles: dado el perfil de datos actual es un nombre voluntario y público, el riesgo de compliance es bajo/nulo.
- El valor de RelocaPet depende de que la información sobre requisitos de países y políticas de aerolíneas esté actualizada.

## Escenarios contemplados

| Escenario | Probabilidad | Impacto |
|-----------|-------------|---------|
| Caída de una AZ | Media | Bajo |
| Corrupción de datos por un bug de la app | Baja | Muy alto (RelocaPet no tiene todavía un ambiente de staging separado de producción, sin ese paso intermedio, un bug de este tipo tiene más chances de llegar directo a producción) | 
| Borrado accidental de datos | Baja | Alto ( Hoy no hay versionado en el bucket de S3 ni una separación de permisos entre "tener el `DATABASE_URL` de producción" y "poder borrar todo", el único control es el `Secrets Manager` describiendo la credencial, no un límite de qué se puede hacer con ella) |
| Falla total de la región AWS (`us-east-1`) | Muy baja | Crítico (toda la arquitectura vive en una sola región, hoy no existe ninguna mitigación para este caso) |
| RDS se queda sin storage disponible | Baja | Crítico (deja de generar backups automáticos) | 
| Error humano en IaC | Bajo | Alto (actualmente no hay ambiente staging/dev separado de producción | 

## RTO y RPO

RelocaPet corre un workload de criticidad baja/media (sin transacciones, sin SLA, sin impacto regulatorio), por eso los RTO/RPO abajo priorizan costo sobre velocidad de recuperación.

| Métrica | Valor objetivo |
|---------|-----------------|
| **RTO** (Recovery Time Objective) | Minutos (AZ, failover automático) a horas (falla total de región, ver *Estrategia de DR*) |
| **RPO** (Recovery Point Objective) | ~0 (AZ, réplica síncrona) a 15 min (falla de región, cross-region backups) |


## Estrategia de DR: Backup and Restore

En mi caso, el escenario de pérdida de una AZ ya está resuelto por RDS Multi-AZ. Lo único que queda sin cubrir es la **pérdida de la región completa**, un evento de probabilidad "muy baja".

## Backups de la base de datos

- **Backups snapshots automáticos:** RDS los activa por default.
- **Point-in-Time Recovery (PITR):** RDS sube los logs a S3 y con eso podría restaurar a cualquier instante dentro del período de retención.
- **Failover Multi-AZ (dentro de la misma región):** ante la caída de la AZ donde está el primary, RDS promueve el standby automáticamente.
- **Cross-Region Automated Backups:** para el escenario de falla total de región, activo la replicación automática de RDS hacia una región secundaria.

## Backup del bundle de React (S3) y de las imágenes (ECR)

- **S3 Cross-Region Replication (CRR):** replica el bucket del bundle a un bucket en la región secundaria. Para este bucket (el bundle solo cambia cuando hacés un deploy, no constantemente) esa ventana es aceptable, no se justifica pagar por S3 RTC para un archivo que cambia pocas veces por mes. Además, activar versionado de S3.
- **Amazon ECR (replicación de imágenes):** se configuran replication rules hacia la región secundaria.


## Procedimiento de recuperación ante caída de región

1. Se detecta la falla de la región primaria (AWS Health Dashboard, alarmas de CloudWatch, o el health checks).
2. Se desplegaría la infraestructura base en la región secundaria a partir de IaC.
3. Se restaura RDS en la región secundaria a partir del snapshot más reciente.
4. El bucket S3 replicado ya tiene el bundle de React disponible (S3 CRR).
5. Se despliegan las imágenes de ECR ya replicadas en los nuevos servicios de ECS Fargate.
6. Se actualiza el registro de Route 53 para apuntar al nuevo ALB de la región secundaria.
7. Se verifica que la app responde correctamente (test de los endpoints).
8. Se notifica a los usuarios del downtime.
9. Una vez restaurada la región primaria, se planifica el failback: se vuelve a habilitar la replicación en sentido inverso antes de cortar el tráfico de nuevo hacia `us-east-1`.

