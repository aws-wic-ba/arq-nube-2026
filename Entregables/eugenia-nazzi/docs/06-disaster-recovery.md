# 06 - Pensamiento Arquitectónico y Disaster Recovery

## Usuarios y disponibilidad

Es de público general, cualquier persona mayor de 18 años que quiera llevar un seguimiento de sus controles médicos y vacunas. No hay un "cliente" pagando por su uso, ni un equipo interno dependiendo de la app para trabajar. Es un servicio directo a usuario final (B2C), de uso personal. El catálogo de vacunas incluye ítems específicos de Argentina (ej. Fiebre Hemorrágica Argentina), así que el público es mayormente local/regional, no global.

Por la naturaleza de la app, el uso es esporádico. No hay un "horario (o día) pico" esperable; más probable que haya interacción con la app durante la mañana-tarde (después de una consulta médica o de realizar un estudio/laboratorio).
Este comportamiento da un gran margen de horas para hacer mantenimiento sin impacto. Por ejemplo durante la madrugada (hora Argentina, entre las 2am-6am), queda una ventana de aprox 4 horas.


Si la app cae en horario "pico" el impacto es bajo, no crítico. Esta app no es necesaria su ejecución en tiempo real, ni bloquea el trabajo de un sector. Es solo un recordatorio preventivo, que ahorra tiempo al usuario de revisar su historial de visitas medicas o la fecha de los estudios realizados (si los encuentra). 
Si la app está caída un momento los impactos serían:
- No poder cargar o consultar la planilla en ese momento, pero puede volver a intentarlo más tarde.
- El único punto sensible al tiempo es el job diario de revisión de recordatorios (corre una vez por día, a una hora fija). Si el backend o la DB están caídos en ese momento, el aviso de ese día no se envía. No es grave en el sentido de "se pierde el dato", pero sí podría hacer que alguien no reciba el email ese día puntual y se demore en agendar su control. 
Silly solution: para detectar esa becha, teniendo un usuario 'fake' que tenga 1 registro que 'vence' al siguiente día (y se actualice cada día luego del aviso). No se ejecutara en el día 1 de la app, pero sirve de falso positivo... Todos los día el usuario fake DEBE tener una notificación.
Queda pendiente que el job de recordatorio "se ponga al día", si se detecta que las notificaciones no fueron enviadas. Es decir, que de forma autónoma al no recibir la notificación del control de 'fake', espere a tener la DB y backend sano para hacer el reintento del disparo de los avisos.

## Riesgos y reglas

La app procesa datos de salud, para la Ley Argentina se clasifica como datos sensibles. Esto en la realidad implica, ademas de la protección de los datos personales comunes:
- Consentimiento explícito e informado del usuario para el tratamiento de sus datos de salud (no alcanza con un checkbox genérico de términos y condiciones). [no contemplado en esta version demo].
- Principio de minimización: solo recolectar los datos necesarios para el propósito declarado (la app solo pide fechas y qué control corresponde, no pide diagnósticos ni motivos).
- Derechos de "Acceso, Rectificación, Cancelación, Oposición": el usuario tiene derecho a pedir qué datos tenés de él, corregirlos, o pedir que se borren. [Para futuro: hoy la app no tiene un flujo de "borrar mi cuenta y mis datos"].

**Riesgos técnicos identificados:**
- Punto único de falla por una decisión de costo actual: el NAT Gateway único (no uno por AZ) es hoy el punto más frágil de la arquitectura.
- Fallo silencioso del job de recordatorios (falso negativo): si el scheduler deja de correr (por un deploy mal hecho, un error no capturado, etc.) nadie se entera hasta que un usuario reporta que no le llegó el aviso. No hay una alarma específica sobre "¿corrió el job hoy?". Arriba se realizó una sugerencia simplona con el usuario 'fake', pero no esta implementado.
- Caída de una AZ completa (energía, red, hardware de AWS) — evento de baja probabilidad pero no nulo.

**Riesgos de negocio identificados:**
- Pérdida de confianza si se filtran datos de salud: al ser datos sensibles, una brecha tiene un costo reputacional y legal mayor que en una app de datos comunes (que no deja de ser grave igualmente).
- Abandono de usuarios: si la carga de datos se pierde, es información que a la persona le costó tiempo cargar y no la vuelve a cargar dos veces.

-----------------------------------------------------------------

## Plan de recuperación

### Escenarios de falla contemplados

1. Caída de una AZ: Fargate corre con réplicas y Aurora Serverless v2 tiene resiliencia propia. El punto débil real es el NAT Gateway único, ya identificado arriba.
2. Fallo del job de recordatorios sin que nadie lo note de inmediato. Baja la confiabilidad del usuario para con la app. 
3. Corrupción de datos por error humano o de código: ej. una migración mal escrita, un `DELETE`/`UPDATE` sin `WHERE` correcto ejecutado a mano contra producción.


#### Tier definido para el negocio
Nota agregada en base a lo visto en la clase del curso.
A mi entender y contemplando la app en greneral, estimo que es un servicio con **Tier 1 o 2** (RTO de horas y RPO de minutos). No puede ser Tier 3, dado que el RTO debe ser menor a 24hr, por las notificaciones diarias; y tampoco se justifica un Tier 0 dado el propósito de la app.


### RTO (Recovery Time Objective)

**RTO propuesto: 4 horas.** -> Tier 2
No es una app de misión crítica en tiempo real. Un RTO de algunas horas es razonable y evita pagar por una infraestructura de alta disponibilidad (Warm Standby o Multi-Site) que no se justifica para el nivel de criticidad de este producto.

### RPO (Recovery Point Objective)

**RPO propuesto: 15 minutos.** -> Tier 1
Es un poco más exigente. Perder el historial de controles que un usuario cargó es perder información que a esa persona le costó tiempo ingresar, y que además tiene valor de "registro médico" personal. Este RPO bajo no cuesta infraestructura extra con la arquitectura diseñada: Aurora Serverless hace backups continuos automáticos con capacidad de restauración de segundos. El RPO de 15 minutos, con la configuración básica del servicio, es factible sin costo adicional.

### Estrategia de DR elegida: **Backup & Restore**

Como se propuso un RTO de 4 horas, encaja perfecto con lo que ofrece la estrategia de 'Backup & Restore', sin elevar los costos innecesariamente.

Nota: Pilot Light sería la alternativa más conveniente si el proyecto creciera en cantidad de usuarios o un tercero 'adquiere' la app para sumar a su negocio (ej: Grupo Gamma u Oroño en Rosario). Con esa estrategia, se mantiene una réplica de Aurora corriendo en otra región (con costo bajo porque no hay cómputo) que permitiría bajar el RTO a decenas de minutos.


### Plan de backups

- Base de datos (Aurora Serverless): backups automáticos habilitados con una retención de al menos 7 días, más el recovery que el motor ya ofrece de forma estandar. Además, snapshots manuales antes de cualquier operación riesgosa, para tener un punto de restauración explícito más allá de los automáticos.
- Prueba periódica de restauración: un backup que nunca se probó restaurar no es un backup confiable — restaurar un snapshot a un ambiente separado cada 3 semanas y validar que los datos estén completos.
- Código e infra: el repositorio Git es la fuente de verdad para reconstruir todo lo que no es dato de usuario. El control de versiones es un plus ante errores, siempre se puede volver a una versión "anterior" estable y funcional.
