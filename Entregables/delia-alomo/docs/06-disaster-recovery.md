# 06 - Pensamiento arquitectónico y Disaster Recovery

## Usuarios y disponibilidad

ZeroToTech es usada por personas que están explorando su primer paso en tecnología: estudiantes, personas en reconversión laboral, curiosos del sector IT. No hay un horario de uso concentrado ni un SLA comprometido con clientes o empresas — es un uso libre, principalmente fuera de horario laboral (noches, fines de semana).

Esto tiene dos consecuencias directas para el diseño de disponibilidad:

El mantenimiento se puede programar en horarios de bajo tráfico (por ejemplo, madrugada entre semana), sin necesidad de ventanas de mantenimiento anunciadas ni arquitecturas de "cero downtime" complejas.

Si la app cae en un momento puntual, el impacto es moderado, no crítico: un usuario que no puede entrar simplemente reintenta más tarde. No hay una operación de negocio que dependa de la disponibilidad inmediata.

## Riesgos y reglas

Privacidad de datos: al incorporar Cognito y DynamoDB, ZeroToTech empieza a manejar datos personales (email, progreso de aprendizaje). Conviene aplicar buenas prácticas desde el diseño: no pedir más datos de los necesarios, y no almacenar información sensible fuera de Cognito.

Riesgo técnico principal: al ser un proyecto mantenido por una sola persona, el mayor riesgo no es la infraestructura, sino el error humano: un despliegue con un bug, un cambio mal aplicado en una función Lambda, o una eliminación accidental de datos.

Riesgo de negocio: si un usuario completa el test de orientación y pierde ese progreso por una falla, es probable que no vuelva a intentarlo. Por eso la prioridad de este plan de DR no es tanto "que la app nunca caiga", sino "que los datos de progreso nunca se pierdan".

## RTO y RPO definidos

En base a cómo se usa la app hoy:

RTO (Recovery Time Objective): algunas horas. Una caída moderada es tolerable mientras se resuelve en el mismo día, sin necesidad de arquitectura activa-activa multi-región.

RPO (Recovery Point Objective): minutos. La pérdida de datos de progreso sí es crítica; el objetivo es no perder más que los últimos minutos de actividad ante una falla.

Esta combinación (RTO moderado, RPO bajo) es clave para justificar la estrategia elegida: no hace falta pagar por alta disponibilidad extrema, pero sí es fundamental invertir en que los datos estén siempre respaldados casi en tiempo real.

## Escenarios de falla contemplados

## Estrategia de Disaster Recovery: Backup & Restore

De las cuatro estrategias posibles (Backup & Restore / Pilot Light / Warm Standby / Multi-Site), se eligió Backup & Restore, por ser la que mejor se ajusta al RTO de horas y al presupuesto de un proyecto en etapa temprana:

Pilot Light o Warm Standby implicarían mantener infraestructura replicada en otra región lista para activarse, con costo recurrente que no se justifica con un RTO de horas.

Multi-Site (activo-activo en varias regiones) es la estrategia más cara y compleja, pensada para aplicaciones críticas con RTO casi nulo.

Backup & Restore aprovecha que la mayoría de los servicios elegidos (DynamoDB, Cognito) ya tienen backups automáticos incluidos por AWS, sin infraestructura adicional en espera.

## Cómo se harían los backups

DynamoDB: activar Point-in-Time Recovery (PITR), que hace backups continuos y permite restaurar a cualquier momento dentro de los últimos 35 días — esto sostiene el RPO de minutos.

Cognito: el pool de usuarios es administrado por AWS; se recomienda exportar periódicamente la configuración del User Pool (IaC) para poder recrearlo rápido si hiciera falta.

Frontend (S3): versionado de bucket activado, para poder revertir a una versión anterior del sitio ante un deploy con errores.

Infraestructura como código: definir todos los recursos con AWS SAM o Terraform, para poder recrear el entorno completo desde cero en minutos si hiciera falta.

## Qué mejoraría con más tiempo o presupuesto

Automatizar pruebas periódicas de restauración (no solo tener backups, sino confirmar que funcionan).

Agregar alarmas de CloudWatch que avisen ante una tasa de errores anómala en Lambda.

Evaluar Warm Standby más adelante, si el proyecto pasa de MVP educativo a tener usuarios dependientes de la disponibilidad (por ejemplo, mentorías en tiempo real).
