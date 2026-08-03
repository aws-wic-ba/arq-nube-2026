# 06 — Disaster Recovery

## Contexto de la aplicación

CloudDesk está pensada para estudiantes universitarios, compañeros de trabajo y equipos que colaboran en proyectos.

Los usuarios podrían necesitar sus documentos durante clases, reuniones, entregas o jornadas laborales. Una caída breve puede retrasar el trabajo, pero la pérdida definitiva de archivos tendría un impacto mayor.

La motivación de este proyecto está relacionada con una experiencia personal: perdí el acceso a mi cuenta universitaria y no pude recuperar los documentos almacenados en Drive. Por eso considero importante que CloudDesk tenga backups, versionado y procedimientos de recuperación.

## Objetivos de recuperación

No todas las fallas tienen el mismo impacto. Por eso definí objetivos diferentes para fallas normales y para un desastre regional completo.

### Fallas de un contenedor o una zona de disponibilidad

- **RTO:** 10 minutos.
- **RPO:** 5 minutos.

El RTO indica cuánto tiempo puede permanecer fuera de servicio la aplicación.

El RPO indica cuántos datos recientes se podrían perder como máximo.

Para este tipo de falla utilizaría tareas ECS en dos zonas de disponibilidad, healthchecks, Application Load Balancer y RDS Multi-AZ.

ECS puede reemplazar un contenedor que deje de funcionar. Si falla una zona, el Load Balancer puede dirigir las solicitudes a otra tarea y RDS puede realizar un failover.

### Desastre regional completo

- **RTO:** 4 horas.
- **RPO:** 1 hora.

Un desastre regional es menos probable, pero requiere reconstruir la infraestructura en otra región y restaurar los datos.

Elegí objetivos distintos porque mantener una copia completa y activa de CloudDesk en otra región aumentaría demasiado el costo para una aplicación universitaria.

Si en el futuro CloudDesk almacenara información bancaria o de pagos, el RTO y el RPO deberían ser mucho menores y la arquitectura necesitaría mayor redundancia.

## Estrategia de Disaster Recovery

Para un desastre regional utilizaría una estrategia de **Backup and Restore**.

Esta estrategia conserva copias de seguridad en otra región, pero no mantiene toda la aplicación ejecutándose permanentemente allí.

La elegí porque ofrece un equilibrio razonable entre costos y recuperación para una aplicación pequeña.

La estrategia incluiría:

- Backups automáticos de Amazon RDS.
- Recuperación de RDS a un punto en el tiempo.
- Snapshots diarios copiados a otra región.
- Versionado en Amazon S3.
- Replicación de los archivos importantes a otra región.
- Infraestructura como código para reconstruir la VPC, ECS y el Load Balancer.
- Imágenes Docker almacenadas en Amazon ECR.
- Documentación de los pasos de recuperación.

## Backups y retención

### Amazon RDS

Configuraría:

- Backups automáticos con una retención de 14 días.
- Recuperación a un punto en el tiempo.
- Un snapshot diario.
- Copia de snapshots a una segunda región.
- Retención de snapshots diarios durante 35 días.
- Un snapshot mensual conservado durante 12 meses.

### Amazon S3

Configuraría:

- Versionado de objetos.
- Cifrado con AWS KMS.
- Bloqueo del acceso público.
- Replicación a otra región para los documentos importantes.
- Conservación de versiones anteriores durante 365 días.
- Políticas para mover versiones antiguas a clases de almacenamiento más económicas.

El versionado permitiría recuperar un archivo eliminado o modificado por error.

## Escenarios de falla

### Caída de un contenedor

**Detección:** el healthcheck deja de responder.

**Respuesta:** ECS detiene la tarea con problemas y crea una nueva. El Load Balancer deja de enviarle solicitudes.

**Impacto esperado:** interrupción breve y sin pérdida de archivos.

### Caída de una zona de disponibilidad

**Detección:** fallan tareas o componentes ubicados en una zona.

**Respuesta:** el Load Balancer dirige el tráfico a una tarea de otra zona. RDS Multi-AZ realiza un failover si fuera necesario.

**Impacto esperado:** degradación temporal, pero la aplicación continúa disponible.

### Eliminación accidental de un archivo

**Detección:** el usuario informa que el documento ya no aparece o CloudTrail registra la operación.

**Respuesta:** se recupera una versión anterior desde Amazon S3 y se restaura su relación con los metadatos.

**Impacto esperado:** recuperación del documento sin depender de una copia guardada en la computadora del usuario.

### Corrupción de la base de datos

**Detección:** errores de consultas, datos inconsistentes o alarmas de RDS.

**Respuesta:** se detienen temporalmente las escrituras y se restaura RDS a un punto anterior a la corrupción.

**Impacto esperado:** se podrían perder como máximo los cambios comprendidos dentro del RPO.

### Credenciales comprometidas

**Detección:** accesos inusuales, alertas de seguridad o modificaciones no autorizadas.

**Respuesta:** se bloquea la credencial, se rotan los secretos, se revisan los registros de CloudTrail y se restaura información si se detectaron modificaciones.

**Impacto esperado:** interrupción controlada mientras se protege la información.

### Caída completa de la región

**Detección:** AWS informa problemas regionales y los servicios dejan de responder.

**Respuesta:** se activa el procedimiento de recuperación en la región secundaria.

**Impacto esperado:** recuperación dentro del RTO regional de 4 horas y pérdida máxima de hasta 1 hora de cambios.

## Procedimiento ante un desastre regional

1. Confirmar que el problema afecta a la región y no solamente a un contenedor o una zona.
2. Detener cualquier despliegue o modificación.
3. Informar a los usuarios que CloudDesk se encuentra en recuperación.
4. Desplegar la red, ECS, Load Balancer y políticas desde infraestructura como código en la región secundaria.
5. Restaurar el último snapshot válido de Amazon RDS.
6. Conectar la aplicación con los archivos replicados en Amazon S3.
7. Rotar las credenciales y secretos.
8. Ejecutar pruebas de login, búsqueda, carga y descarga.
9. Verificar la integridad de una muestra de documentos.
10. Cambiar Route 53 para dirigir a los usuarios hacia la región recuperada.
11. Monitorear errores y comunicar que el servicio volvió a estar disponible.
12. Documentar lo ocurrido y mejorar el procedimiento.

## Pruebas del plan

Un backup no es útil si nunca se comprobó que puede restaurarse.

Por eso realizaría:

- Una revisión mensual para verificar que los backups se estén generando.
- Una restauración trimestral de RDS en un entorno de prueba.
- Una recuperación trimestral de una muestra de archivos de S3.
- Una simulación semestral de pérdida de la región.
- Una comparación entre los tiempos reales y los objetivos RTO y RPO.

Después de cada prueba actualizaría el procedimiento con los problemas encontrados.

## Privacidad y riesgos

CloudDesk podría almacenar trabajos universitarios, información personal o documentos internos de proyectos.

Aplicaría las siguientes medidas:

- Guardar solamente la información necesaria.
- Limitar el acceso según el usuario o equipo.
- Registrar acciones administrativas.
- Cifrar archivos y base de datos.
- Establecer una política de retención y eliminación.
- Evitar cargar información sensible que no sea necesaria.
- Revisar las obligaciones de la Ley argentina 25.326 si la aplicación almacenara datos personales.

## Conclusión

Mi prioridad es evitar que otros usuarios atraviesen una situación similar a la pérdida de archivos que experimenté con mi cuenta universitaria.

Por eso CloudDesk combina versionado, backups y redundancia. Al mismo tiempo, elegí Backup and Restore para un desastre regional porque resulta más económico que mantener una segunda aplicación completamente activa.

Si CloudDesk creciera o almacenara información más crítica, evaluaría una estrategia Warm Standby para reducir el tiempo de recuperación.