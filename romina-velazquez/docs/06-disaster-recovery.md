# 06 — Plan de recuperación ante desastres

## Escenarios contemplados

| Escenario | Probabilidad | Impacto |
|-----------|-------------|---------|
| Caída de una Availability Zone | Media | Alto |
| Corrupción de datos por bug en la app | Baja | Muy alto |
| Borrado accidental de datos | Baja | Alto |
| Falla total de la región AWS | Muy baja | Crítico |

## RTO y RPO

| Métrica | Valor estimado |
|---------|----------------|
| **RTO** (Recovery Time Objective) | 15 minutos |
| **RPO** (Recovery Point Objective) | 5 minutos (con PITR de RDS) |

## Estrategia de DR: Pilot Light

Mantenemos la infraestructura mínima corriendo en una segunda región (us-west-2), lista para escalar ante un desastre en la región primaria (us-east-1).

- La réplica de RDS se actualiza continuamente
- Las imágenes Docker están replicadas en ECR en ambas regiones
- Route 53 tiene configurado failover automático con health checks

## Backups de la base de datos

- **Automated backups de RDS:** retención de 7 días con Point-in-Time Recovery (PITR) cada 5 minutos
- **Snapshots manuales:** antes de cada deploy mayor
- **Exportación a S3:** snapshots diarios exportados a S3 con replicación cross-region habilitada
- **S3 Lifecycle Policy:** backups retenidos 90 días en S3 Standard, luego movidos a Glacier

## Procedimiento de recuperación ante caída de región

1. CloudWatch detecta la falla y dispara la alarma
2. Se promueve la réplica de RDS en us-west-2
3. Se actualiza el registro de Route 53 para apuntar a us-west-2
4. ECS en la región secundaria escala los contenedores
5. Se verifica que la app responde correctamente
6. Se notifica a los usuarios del downtime
7. Una vez restaurada la región primaria, se hace failback planificado
