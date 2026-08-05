# Well-Architected Framework

Aplicado a la app de becas universitarias del ayuntamiento de Hunucmá, Yucatán, México.

Pilares que aplico a esta arquitectura: **Seguridad**, **Fiabilidad**, **Optimización de costos** y **Excelencia operativa**. Dejo afuera Eficiencia de Rendimiento y Sostenibilidad como foco principal porque el volumen de tráfico de este sistema (trámite municipal, picos estacionales) no lo exige — lo menciono al final como algo a revisar si crece.

## Seguridad

Manejo datos personales sensibles: CURP, INE, acta de nacimiento. Decisiones:

- **Cifrado en tránsito**: TLS de punta a punta (CloudFront/ALB terminan HTTPS).
- **Cifrado en reposo**: S3 con SSE-KMS para los documentos, RDS con cifrado nativo habilitado.
- **Mínimo privilegio**: el rol de tarea de ECS sólo tiene permisos sobre el bucket/prefijo de documentos y sobre el secreto de RDS que le corresponde, nada de acceso administrativo.
- **Credenciales fuera del código**: password de base en Secrets Manager, no en variables planas del contenedor (como sí hago en local, que es aceptable sólo para desarrollo).

Qué mejoraría con más tiempo: autenticación real para el panel de trabajador (hoy en el TP la ruta `/trabajador` no tiene login, es el punto más débil de esta versión) — agregaría Cognito o al menos usuario/contraseña con roles.

## Fiabilidad

- **RDS Multi-AZ**: si la instancia primaria de la base cae, hay failover automático a la réplica en otra zona de disponibilidad, sin intervención manual.
- **ECS Fargate con mínimo 2 tareas** detrás del ALB: si una tarea falla o se recicla, el ALB sigue enrutando a la otra sin caída visible para el usuario.
- **S3** ya replica los documentos entre múltiples AZs por diseño del servicio.

Qué mejoraría: hoy el diseño es de una sola región. Con más presupuesto evaluaría backups cross-region de RDS y S3 para cubrir una caída regional completa (ver `06-disaster-recovery.md`).

## Optimización de costos

- Fargate en vez de EC2 dedicado: pago sólo por las tareas corriendo, sin servidores ociosos fuera de horario de trámite.
- RDS en una instancia pequeña (`db.t4g.micro` o similar) porque el volumen de escritura es bajo — una convocatoria de becas no genera miles de solicitudes por segundo.
- CloudFront reduce llamadas repetidas al backend para assets estáticos, bajando cómputo de ECS.

Detalle completo en `05-costos.md`.

## Excelencia operativa

- **CloudWatch Logs** centraliza logs de la app — hoy en local reviso logs con `docker compose logs`, en AWS eso se pierde si no lo centralizo.
- **CloudWatch Alarms** sobre CPU/memoria de ECS y conexiones de RDS, para enterarme antes que el sistema se caiga en medio de una convocatoria, que es el peor momento posible.
- El pipeline de despliegue (fuera de alcance de este TP, pero lo dejo planteado): build de la imagen Docker → push a ECR → actualización de servicio ECS, sin downtime gracias al rolling update de ECS.

## Pilares que dejo afuera (por ahora)

- **Eficiencia de rendimiento**: el tráfico esperado es bajo (un municipio, una convocatoria). Autoscaling agresivo sería sobre-ingeniería para el caso de uso actual.
- **Sostenibilidad**: Fargate ya evita servidores ociosos, que es la principal palanca de sostenibilidad disponible a esta escala; no profundizo más porque no es el foco de este sistema.
