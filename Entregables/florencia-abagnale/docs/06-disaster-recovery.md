# 06 — Plan de recuperación ante desastres

## Escenarios contemplados

| Escenario | Probabilidad | Impacto |
|---|---|---|
| Caída de una Availability Zone | Media | Bajo — S3 y DynamoDB son multi-AZ por default, sin acción manual |
| Falla de la Lambda a mitad de una corrida (ej. se corta la conexión con Jira) | Media | Alto si no se maneja — un rol de riesgo podría quedar sin revisión |
| Borrado o sobreescritura accidental de un reporte en S3 | Baja | Medio — mitigado con versionado |
| Corrupción de la tabla de auditoría en DynamoDB | Baja | Alto — es el registro de trazabilidad para auditoría |
| Falla total de la región AWS | Muy baja | Crítico, pero tolerable dado el tipo de proceso |

## RTO y RPO

| Métrica | Valor estimado | Por qué |
|---|---|---|
| **RTO** (tiempo de recuperación aceptable) | Algunas horas | No es un sistema transaccional en tiempo real — un retraso de medio día en una corrida de migración no es grave. |
| **RPO** (datos que se pueden perder) | ~0 para reportes ya generados | S3 con versionado no pierde nada; DynamoDB con Point-in-Time Recovery permite restaurar a cualquier minuto de los últimos 35 días. |

## Estrategia de DR: Backup & Restore

De las cuatro estrategias que contempla AWS (Backup & Restore, Pilot
Light, Warm Standby, Multi-Site), elijo **Backup & Restore** — la más
simple y económica. Pilot Light o Multi-Site (una segunda región
corriendo en paralelo) se justifican para sistemas con usuarios finales
esperando respuesta inmediata; este es un proceso batch interno que
tolera unas horas de downtime, así que pagar por infraestructura
duplicada en una segunda región no tiene sentido para el caso de uso.

- **S3**: versionado activado — cualquier reporte se puede recuperar
  aunque se sobrescriba o borre por error.
- **DynamoDB**: Point-in-Time Recovery activado, para restaurar la
  tabla de auditoría a cualquier momento de los últimos 35 días.
- **Secrets Manager**: el token de Jira se recrea manualmente desde
  Jira Cloud si se pierde — no necesita backup propio.


## Procedimiento de recuperación ante una falla de la Lambda

1. CloudWatch Alarms detecta la tasa de error o el evento fallido.
2. SNS notifica al equipo de seguridad (email/Slack).
3. El evento que falló queda en la Dead Letter Queue (SQS), no se
   pierde.
4. Se revisa manualmente el motivo de la falla (log en CloudWatch
   Logs).
5. Se reprocesa el evento desde la DLQ una vez resuelta la causa.
6. Se verifica en el reporte de compliance que la corrida quedó
   completa y trazada.

## Procedimiento ante corrupción de datos en DynamoDB

1. Se identifica el rango horario afectado.
2. Se restaura la tabla a un punto anterior con Point-in-Time
   Recovery (a una tabla nueva, sin pisar la original).
3. Se valida la integridad de los datos restaurados contra los
   reportes correspondientes en S3 (que sí tienen versionado).
4. Se promueve la tabla restaurada una vez validada.
