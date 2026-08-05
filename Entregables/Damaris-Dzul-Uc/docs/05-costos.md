# Estimación de costos

Estimado con [AWS Pricing Calculator](https://calculator.aws/), región `us-east-1`, para un escenario realista: municipio de Hunucmá, Yucatán, México, una convocatoria de becas con algunos cientos de solicitudes concentradas en pocas semanas al año, con baja actividad el resto del tiempo.

## Servicios más costosos

| Servicio | Config estimada | Costo aprox./mes |
|----------|------------------|-------------------|
| **RDS PostgreSQL Multi-AZ** | `db.t4g.micro`, 20 GB | El más caro de la lista — Multi-AZ duplica el costo de la instancia por tener réplica en standby |
| **ECS Fargate** | 2 tareas mínimas, 0.25 vCPU / 0.5 GB c/u | Segundo más caro porque corren 24/7 aunque no haya tráfico, para mantener el panel de trabajadores disponible |
| **NAT Gateway** (si las tareas van en subred privada) | 1 NAT Gateway | Cargo fijo por hora + por GB — a esta escala puede pesar tanto como el cómputo |
| CloudFront + ALB + S3 + Route 53 | tráfico bajo | Costo marginal, factura mínima base + centavos por GB transferido |

## Decisiones para optimizar costos

- **RDS single-AZ en vez de Multi-AZ para una primera versión**: la convocatoria de becas no es un sistema de misión crítica 24/7 (ver `06-disaster-recovery.md` — tolero unas horas de downtime), así que arranco single-AZ y paso a Multi-AZ sólo si el municipio decide que vale la pena el costo duplicado.
- **Sin NAT Gateway**: pongo las tareas de Fargate en subred pública con security group restrictivo, en vez de subred privada + NAT Gateway, porque el NAT Gateway puede costar más que el resto de la arquitectura junta para este volumen de tráfico.
- **Fargate con mínimo de tareas (1-2)** en vez de sobre-provisionar: la app no necesita alta capacidad todo el año, sólo en la ventana de la convocatoria.
- **S3 Standard** para documentos (no Glacier) porque el trabajador necesita acceso inmediato durante la revisión; evaluaría mover a **S3 Glacier Instant Retrieval** los documentos de solicitudes ya resueltas (aprobadas/rechazadas) hace más de un año, vía lifecycle policy.

## Qué evitaría o simplificaría en una primera versión

- Multi-AZ en RDS (mencionado arriba).
- WAF completo: arrancaría con las reglas gratuitas/básicas de AWS Managed Rules en vez de un set custom.
- CloudFront podría posponerse en una v0 muy inicial y agregarse cuando haya usuarios fuera de la red local — el ALB solo ya sirve la app.
