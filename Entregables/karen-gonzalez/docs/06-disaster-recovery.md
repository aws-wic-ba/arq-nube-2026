# 06 — Plan de recuperación ante desastres

## Escenarios contemplados

| Escenario | Probabilidad | Impacto |
|-----------|-------------|---------|
| Caída de una Availability Zone (AZ) | Media | Alto |
| Corrupción de datos por bug en la app o script | Baja | Muy alto |
| Borrado accidental de registros/campañas | Baja | Alto |
| Falla total de la región AWS (`us-east-1`) | Muy baja | Crítico |

## RTO y RPO

| Métrica | Valor estimado |
|---------|----------------|
| **RTO** (Recovery Time Objective) | 15 minutos |
| **RPO** (Recovery Point Objective) | 5 minutos (con PITR de RDS) |

## Estrategia de DR: Pilot Light

Mantenemos la infraestructura base en una segunda región (`us-west-2`), lista para escalar ante una falla catastrófica en la región primaria (`us-east-1`):

- Read Replica de RDS PostgreSQL con replicación continua entre regiones.
- Imágenes Docker de la API y Nginx replicadas automáticamente en Amazon ECR en ambas regiones.
- Route 53 configurado con *Failover Routing Policy* y chequeos de salud automáticos.

## Backups de la base de datos y archivos

- **Automated backups de RDS:** Retención de 7 días con Point-in-Time Recovery (PITR) cada 5 minutos.
- **Snapshots manuales:** Ejecutados antes de cada deploy mayor en el backend.
- **Replicación en S3:** Fotos de comprobantes y recetas guardadas en S3 con Cross-Region Replication (CRR) hacia `us-west-2`.
- **S3 Lifecycle Policy:** Snapshots y archivos con más de 30 días se migran a S3 Glacier; se borran tras 90 días.

## Procedimiento de recuperación ante caída de región

1. Route 53 o CloudWatch detectan la indisponibilidad de la región primaria (`us-east-1`).
2. Se promueve la Read Replica de RDS PostgreSQL en `us-west-2` a base de datos principal de escritura.
3. Route 53 conmuta el tráfico DNS automáticamente hacia el Load Balancer de la región secundaria.
4. ECS Fargate en `us-west-2` escala las tareas de la API de donaciones.
5. Se valida el funcionamiento de los endpoints de la API (`/api/health`) y la conectividad con PostGIS.
6. Una vez reestablecida la región primaria, se sincronizan los datos y se realiza un *failback* planificado.