# 04 · Well-Architected Framework

> No es obligatorio cubrir los 6 pilares. Elegí los que apliquen a tu arquitectura (la de
> `03-arquitectura-aws.md`) y desarrollalos vos. Dejo las preguntas guía del enunciado más
> algunas ideas de qué mirar en **esta** app puntual, para orientarte — la respuesta final
> tiene que ser tuya.

## Excelencia Operativa

*¿Cómo monitoreás? ¿Cómo desplegás cambios?*

Pistas para esta app: CloudWatch Logs/Alarms sobre ECS y RDS, pipeline de CI/CD que construye
la imagen y hace `ecs update-service` (o similar), health checks del Load Balancer.

> ✍️ Completar.

## Seguridad

*¿Cómo protegés datos y secretos? ¿Quién puede acceder a qué?*

Pistas: la `DATABASE_URL` no debería estar hardcodeada (hoy está en el `docker-compose.yml`
como texto plano — en AWS pensá en Secrets Manager); la base de datos no debería tener IP
pública; roles IAM con mínimo privilegio para las tareas de ECS.

> ✍️ Completar.

## Fiabilidad

*¿Qué pasa si un componente falla? ¿Hay redundancia?*

Pistas: ¿qué pasa hoy si el contenedor de Postgres se cae? (spoiler: la app deja de responder,
no hay réplica). ¿Cómo lo resolverías en AWS? (RDS Multi-AZ, múltiples tareas de ECS en
distintas AZ, etc.)

> ✍️ Completar. Esto se conecta directamente con `06-disaster-recovery.md`.

## Eficiencia de Rendimiento

*¿Cómo escala la solución ante picos de uso?*

Pistas: hoy es un solo contenedor con `workers(2)` fijo. En AWS, ¿usarías auto scaling en ECS?
¿Con qué métrica (CPU, requests por target)?

> ✍️ Completar.

## Optimización de Costos

*¿Cómo evitás gastos innecesarios?*

Ver el detalle en `05-costos.md`. Acá resumí la decisión principal (ej: Fargate Spot,
tamaño de instancia de RDS, etc.) y por qué la tomaste.

> ✍️ Completar.

## Sostenibilidad

*¿Minimizás recursos ociosos?*

Pistas: ¿tiene sentido escalar a cero fuera de horario si los usuarios son internos? ¿Fargate
vs. tener servidores prendidos 24/7 sin necesidad?

> ✍️ Completar (opcional si no aplica a tu caso).
