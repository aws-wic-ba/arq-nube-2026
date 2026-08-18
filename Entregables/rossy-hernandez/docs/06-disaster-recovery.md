# 06 — Plan de recuperación ante desastres

## Escenarios contemplados

| Escenario | Probabilidad | Impacto |
|---|---|---|
| Falla temporal de la función Lambda | Baja | Medio (reintentos automáticos por parte de API Gateway) |
| Corrupción o borrado accidental de un ítem en DynamoDB | Baja | Alto |
| Caída de una Availability Zone | Muy baja | Bajo (DynamoDB y Lambda son multi-AZ por diseño, de forma nativa y sin configuración extra) |
| Falla total de la región AWS | Muy baja | Crítico |

## RTO y RPO

| Métrica | Valor estimado |
|---|---|
| RTO (Recovery Time Objective) | Minutos (servicios serverless se recuperan automáticamente; DynamoDB y Lambda son resilientes a fallos de AZ por defecto) |
| RPO (Recovery Point Objective) | Segundos, con Point-in-Time Recovery (PITR) de DynamoDB activado |

## Ventaja de la arquitectura serverless para DR

A diferencia de una arquitectura con servidores o contenedores propios,
**DynamoDB y Lambda son servicios administrados multi-AZ por defecto**
dentro de una región — no requieren configuración manual de
replicación entre zonas de disponibilidad, lo que reduce
significativamente la complejidad operativa del plan de recuperación
en comparación con, por ejemplo, una base de datos relacional
autogestionada.

## Backups de la base de datos

- **Point-in-Time Recovery (PITR)** de DynamoDB: permite restaurar la
  tabla a cualquier punto en los últimos 35 días, con granularidad de
  segundos.
- **On-Demand Backups**: se recomienda tomar un backup manual antes de
  cambios estructurales importantes (por ejemplo, antes de migrar
  datos o cambiar el modelo de acceso).
- **Exportación a Amazon S3**: para retención a largo plazo, se puede
  exportar la tabla completa a S3 de forma periódica.

## Procedimiento de recuperación ante borrado accidental de datos

1. Activar (si no está activo) **Point-in-Time Recovery** en la tabla
   afectada.
2. Restaurar la tabla a una nueva tabla, al punto en el tiempo previo
   al incidente, usando la consola de DynamoDB o la API.
3. Verificar la integridad de los datos restaurados en la tabla nueva.
4. Redirigir la aplicación (Lambda) hacia la tabla restaurada, o
   migrar los datos de vuelta a la tabla original.
5. Documentar el incidente y su causa raíz para prevenir recurrencias.

## Recuperación ante falla total de la región (fase futura)

Para el diseño objetivo completo (con Aurora y componentes con estado
adicional), se contempla una estrategia de **réplica en una segunda
región** (por ejemplo `us-west-2`) mediante DynamoDB Global Tables y
replicación de Aurora, con failover gestionado a través de Amazon
Route 53 — a implementar cuando el proyecto escale más allá de la Fase 1.
