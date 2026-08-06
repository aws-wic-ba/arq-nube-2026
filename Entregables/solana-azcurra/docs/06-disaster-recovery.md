# 06 — Plan de recuperación ante desastres

## ¿Quién se ve afectado si la app se cae?

- **Vecinos:** no pueden publicar material ni consultar sus puntos
- **Emprendedores:** no pueden responder publicaciones ni registrar canjes
- **Municipio:** no puede administrar la plataforma ni ver reportes

No es una aplicación crítica: una caída de algunas horas no pone en riesgo a nadie, las publicaciones y canjes pueden esperar. Lo que **no** puede pasar es perder los puntos acumulados de los vecinos, porque es la base de la confianza en el sistema.

## Riesgos contemplados

| Escenario | Probabilidad | Impacto |
|-----------|-------------|---------|
| Caída del contenedor de la app | Media | Bajo (ECS levanta otro automáticamente) |
| Caída de la Availability Zone de RDS | Baja | Alto (la app queda sin base de datos) |
| Borrado o corrupción de datos (bug o error humano) | Baja | Muy alto (afecta los puntos de los vecinos) |

Sobre regulaciones: la app guarda datos personales de los vecinos (nombre, contacto, ubicación aproximada), por lo que aplica la ley de protección de datos personales. Los backups también contienen esos datos, por eso quedan dentro de AWS y cifrados.

## RTO y RPO

| Métrica | Valor | Qué significa para EcoCanje |
|---------|-------|------------------------------|
| **RTO** (Recovery Time Objective) | 4 horas | Tiempo máximo aceptable con la app caída hasta restaurarla |
| **RPO** (Recovery Point Objective) | 5 minutos | Máxima pérdida de datos aceptable: con PITR de RDS puedo restaurar la base al estado de hace 5 minutos |

## Estrategia de DR: Backup & Restore

Elegí **Backup & Restore**, la estrategia más simple y económica de las cuatro (Backup & Restore / Pilot Light / Warm Standby / Multi-Site). No mantengo infraestructura duplicada: si algo falla, restauro desde los backups.

La descarté contra las otras porque todas implican pagar recursos duplicados que casi nunca se usan, y para una app municipal no crítica un RTO de horas es aceptable. Si la app creciera a muchos municipios, reevaluaría Pilot Light.

## Backups

- **Automated backups de RDS:** diarios, con retención de 7 días y Point-in-Time Recovery (PITR)
- **Snapshot manual:** antes de cada deploy con cambios en la base de datos
- **La imagen Docker** está versionada en ECR y el código en GitHub: la app se puede volver a desplegar desde cero en cualquier momento

## Procedimiento de recuperación

1. CloudWatch dispara la alarma de que la app no responde
2. Identifico qué falló (¿app o base de datos?) mirando los logs en CloudWatch
3. Si es la app: ECS ya levanta una tarea nueva solo; si no alcanza, redespliego la imagen desde ECR
4. Si es la base: restauro RDS con PITR al minuto anterior a la falla
5. Verifico que la app responde y que los puntos de los vecinos están correctos
6. Aviso al municipio del downtime y de si hubo pérdida de datos
