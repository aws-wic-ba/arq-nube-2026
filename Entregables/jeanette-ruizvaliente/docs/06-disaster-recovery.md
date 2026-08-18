# 06 — Pensamiento arquitectónico y plan de Disaster Recovery

## Usuarios y disponibilidad

* **Usuarios internos (Account Managers, CSMs):** Usan el dashboard en horario de oficina y días hábiles. El mantenimiento fuera de ese horario no tiene impacto.
* **Usuarios externos (clientes, vía formulario de valoración):** Sin horario fijo, acceden cuando reciben el enlace por correo electrónico.

Si la app se cae en horario pico, el impacto no es una venta perdida en el momento, sino que el Account Manager pierde visibilidad sobre una cuenta en riesgo. El costo real aparece si esa cuenta no renueva, no en la hora de *downtime* en sí. Por eso, el plan prioriza **no perder datos por sobre tener cero downtime**.

---

## Riesgos y reglas que aplican

* **Datos personales de clientes:** Contacto y comentarios de valoración.
* **Riesgo de negocio principal:** Pérdida o corrupción del historial de gestión de cuentas (es más valioso el historial que la disponibilidad momentánea de la interfaz).

---

## Escenarios contemplados

| Escenario | Probabilidad | Impacto |
|---|---|---|
| **Caída de una Availability Zone** | Media | Medio — Multi-AZ lo absorbe automáticamente |
| **Error humano (borrado accidental)** | Media | Alto — se pierde historial de un cliente |
| **Corrupción de datos por bug en un deploy** | Baja | Alto |
| **Falla total de la región AWS** | Muy baja | Alto, tolerable con el RTO definido |

---

## RTO y RPO

| Métrica | Valor | Por qué |
|---|---|---|
| **RTO** | 4 horas | No es una app transaccional; 4 horas de indisponibilidad del dashboard interno es tolerable en un día hábil. |
| **RPO** | 5 minutos | El historial de interacción con un cliente no se puede perder. |

---

## Estrategia de DR: Backup & Restore

Se elige **Backup & Restore** en vez de *Warm Standby* o *Pilot Light* multi-región:

* **Multi-AZ en la misma región** cubre el escenario más probable (caída de una AZ) sin el costo de infraestructura duplicada.
* Una segunda región en *standby* permanente (*Pilot Light*) cubre un escenario de muy baja probabilidad; para el tamaño actual de la app, ese gasto no se justifica frente al RTO de 4 horas definido.
* Cambiaría a *Warm Standby* si el formulario de valoración pasara a formar parte de un SLA contractual con clientes Enterprise.

---

## Backups

* **RDS Automated Backups:** Retención de 7 días con Point-in-Time Recovery (PITR), cubriendo el RPO de 5 minutos.
* **Snapshot manual:** Antes de cada deploy que modifique el esquema de la base de datos.
* **Exportación a S3:** Snapshot semanal con *Lifecycle Policy* a Amazon S3 Glacier después de 30 días.

---

## Procedimiento de recuperación (Caída de región)

1. CloudWatch / Route 53 detectan que la región primaria no responde.
2. Se restaura el snapshot más reciente de RDS en la región secundaria.
3. Se levanta ECS Fargate en la región secundaria desde la imagen almacenada en ECR.
4. Se actualiza Route 53 para apuntar al nuevo endpoint.
5. Se verifica que el dashboard y el formulario público respondan correctamente.
6. Se notifica al equipo interno sobre el incidente.
7. Restaurada la región primaria, se planifica el *failback* fuera del horario operativo.