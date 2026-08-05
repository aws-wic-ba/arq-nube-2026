## 06 — Disaster Recovery (Recuperación ante Desastres) - FitConnect (AWS)

Para garantizar la continuidad operativa de FitConnect ante fallas de infraestructura, cortes de región o corrupción de datos, se establece una estrategia de Recuperación ante Desastres (DR) basada en los requerimientos del sistema (datos de usuarios, DNI, rutinas y ejercicios).

## 1. Objetivos de Recuperación

RPO (Objective Point Recovery / Punto de Objetivo de Recuperación): Máximo 5 minutos de pérdida de datos aceptable en la base de datos transaccional.

RTO (Objective Time Recovery / Tiempo de Objetivo de Recuperación): Menos de 15 minutos para restaurar el servicio completo en producción ante la caída de un clúster o zona de disponibilidad.

## 2. Estrategia de Disaster Recovery por Componente

# A. Base de Datos (RDS PostgreSQL)
Alta Disponibilidad Multi-AZ: La base de datos corre con una instancia replicada sincrónicamente en otra Zona de Disponibilidad (AZ). Si la AZ principal falla, RDS realiza un failover automático transparente hacia la secundaria en segundos.

Backups Automáticos y PITR (Point-in-Time Recovery):

Se configuran copias de seguridad automáticas diarias almacenadas en Amazon S3 con retención de 7 días.

# B. Red y Direccionamiento (Route 53 + CloudFront)
Enrutamiento y DNS: Route 53 maneja políticas de ruteo con comprobaciones de salud (Health Checks). Si el Application Load Balancer principal deja de responder, el DNS puede redirigir el tráfico automáticamente hacia una región de respaldo secundaria (arquitectura Active-Passive).

Caché en el Edge (CloudFront): En caso de caída temporal del backend, CloudFront puede servir páginas estáticas de mantenimiento o assets cacheados para mitigar el impacto visual en el usuario final.

## 3. Plan de Acción ante Incidentes (Runbook)

Detección: Amazon CloudWatch emite alarmas automáticas ante picos de errores 5xx o caída de los health checks del ALB.

Mitigación Automática:

RDS ejecuta el failover Multi-AZ autónomamente.

ECS reemplaza las tareas caídas de Fargate de forma automática.

Restauración Manual (Escenarios Críticos / Corrupción de Datos):

Si ocurre una pérdida lógica masiva de datos, se utiliza RDS PITR para levantar una nueva instancia limpia apuntando al segundo anterior al incidente.

Se actualizan las variables en AWS Secrets Manager si fuera necesario y se redirige el tráfico mediante Route 53.
