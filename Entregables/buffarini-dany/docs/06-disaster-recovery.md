# 06 · Pensamiento arquitectónico y Disaster Recovery



## Usuarios y disponibilidad

Soy la única usuaria de esta app — la uso para llevar el registro de mis prácticas de Rust. No hay un "horario pico" real, porque no depende de terceros: el impacto de una caída depende únicamente de cuándo yo la esté usando en ese momento. Puedo hacer mantenimiento en cualquier horario sin afectar a nadie más. Si la app cae, el impacto real es bajo: pierdo acceso temporal a mi lista de tareas, pero no hay pérdida de negocio ni afecta a otros usuarios.

## Riesgos y reglas

No manejo datos de terceros ni información sujeta a compliance (no es una app comercial). El riesgo que sí identifico es técnico: perder el historial de mis prácticas si la base de datos se corrompe o se borra por error. No planeo cargar información sensible (contraseñas, datos personales de otros) en las descripciones de las tareas, así que el riesgo de exposición de datos es bajo.

## Plan de recuperación

**Escenarios de falla a contemplar** 

Caída de una Availability Zone: al ser una app de bajo tráfico, no justifica tener redundancia Multi-AZ activa; toleraría el tiempo de restauración de un snapshot.
Borrado accidental de datos (ej: un DELETE sin WHERE corriendo una migración a mano): lo mitigaría con snapshots automáticos diarios de RDS.
Error humano en un deploy que rompa la imagen de la app: lo mitigaría manteniendo la versión anterior de la imagen en ECR para poder hacer rollback rápido.

**RTO (Recovery Time Objective):** 
Definí= "4 horas". Porque al ser la única usuaria, tolero estar sin acceso a la app por un tiempo razonable sin que eso tenga consecuencias reales.

**RPO (Recovery Point Objective):** 

Con backups diarios de RDS, perder como máximo un día de tareas cargadas es aceptable para mi caso de uso.

**Estrategia de DR:** Backup & Restore 

Backup & Restore. La elijo porque es la más económica y el impacto de una caída es exclusivamente para mí — no hay justificación de negocio para pagar por Pilot Light o Warm Standby en una app personal de práctica.

**¿Cómo harías backups?**

Usaría los snapshots automáticos de RDS, con una retención corta (ej: 7 días). No replicaría a otra región, porque el valor de los datos no justifica ese costo adicional.
