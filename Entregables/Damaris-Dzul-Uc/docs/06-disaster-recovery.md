# Pensamiento arquitectónico y disaster recovery

## Usuarios y disponibilidad

- **Solicitantes**: estudiantes de Hunucmá, Yucatán, México, público general, usan la app desde su casa o desde un ciber en momentos variados, principalmente concentrados en las semanas en que está abierta la convocatoria de becas.
- **Trabajadores del ayuntamiento**: usan el panel en horario de oficina, días hábiles.

Esto me da una ventana de mantenimiento clara: **fuera de horario de oficina y de madrugada**, cualquier día, el impacto de una caída programada es mínimo. El único período donde no puedo tocar nada es la última semana antes del cierre de convocatoria, cuando el volumen de solicitantes subiendo documentos es más alto.

**¿Qué pasa si la app cae en horario pico (última semana de convocatoria, horario de oficina)?** Impacto real: un solicitante no puede terminar de subir sus documentos y corre el riesgo de perder el plazo de la convocatoria si la caída se extiende. Es un impacto real pero no es un sistema de emergencia (como salud o seguridad) — nadie está en riesgo físico, pero sí hay riesgo de que alguien pierda una oportunidad de beca por una falla técnica, lo cual para mí sí es grave a nivel de justicia del proceso.

## Riesgos y reglas

- **Datos personales sensibles**: CURP, identificación oficial (INE), acta de nacimiento. En México esto cae bajo la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (aplica a un ayuntamiento). Implica: cifrado de estos datos, control de acceso restringido a quien realmente necesita verlos (sólo el trabajador asignado, no todo el personal municipal), y no conservar documentos más tiempo del necesario.
- **Riesgo de negocio**: si se pierde o corrompe una solicitud ya completa, el solicitante podría quedar fuera de la convocatoria sin responsabilidad suya — es un riesgo reputacional para el ayuntamiento, no sólo técnico.
- **Riesgo técnico**: al ser un trámite con fecha límite, cualquier interrupción tiene una ventana de tolerancia mucho menor en los últimos días de la convocatoria que el resto del año.

## Plan de recuperación

**Escenarios de falla contemplados:**
- Caída de una AZ de AWS (RDS o la tarea de ECS en esa zona).
- Corrupción o borrado accidental de datos (ej. un trabajador borra una solicitud por error).
- Error humano en un despliegue (un cambio de código rompe la validación de documentos).

**RTO (Recovery Time Objective):** 4 horas durante la ventana normal del año, y 1 hora durante la última semana de una convocatoria abierta. La diferencia refleja que el costo de la caída no es constante en el tiempo — coincide con lo que noté sobre los usuarios: el sistema es tolerante casi todo el año, pero crítico en la recta final de cada convocatoria.

**RPO (Recovery Point Objective):** 15 minutos. No puedo permitirme perder una solicitud completa que un estudiante ya armó con documentos oficiales — rehacerla implica que vuelva a conseguir papeles como el acta de nacimiento, que no se tramitan de un día para otro.

**Estrategia de DR: Backup & Restore + Multi-AZ** (no llego a Warm Standby ni Multi-Site porque el RTO de 1-4h no lo justifica, y el volumen de este sistema no amerita el costo de mantener infraestructura duplicada corriendo en otra región todo el año):

- RDS Multi-AZ cubre la caída de una sola AZ con failover automático (minutos, no horas) durante la ventana crítica de convocatoria — lo activo temporalmente si el costo de Multi-AZ todo el año no se justifica (ver `05-costos.md`).
- **Backups automáticos de RDS** con retención de al menos 7 días y `point-in-time recovery` habilitado, para cumplir el RPO de 15 minutos ante corrupción o borrado accidental de datos.
- **S3 con versionado** en el bucket de documentos: si un documento se sobreescribe o borra por error, recupero la versión anterior sin tocar backups de base de datos.
- Snapshot manual de RDS **antes de cada despliegue** a producción durante la ventana de convocatoria abierta, para poder revertir rápido si un cambio de código rompe algo (mitiga el escenario de error humano en despliegue).

**Backups:** automáticos diarios de RDS (snapshot) + point-in-time recovery continuo vía WAL; S3 con versionado y replicación dentro de la región (nativa del servicio). No implemento backup cross-region en esta primera versión porque el RTO/RPO definidos no lo requieren, pero lo marco como la primera mejora si el sistema crece a escala estatal en vez de sólo Hunucmá.
