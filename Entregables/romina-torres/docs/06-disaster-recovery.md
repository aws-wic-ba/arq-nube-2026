Usuarios y disponibilidad

Tienda pública 24/7 (AR, MX, BR), sin horario muerto. Mantenimiento con despliegues rolling para minimizar la indisponibilidad. Una caída durante un pico de promoción impacta en ventas.

Riesgos y regulaciones

Datos personales de clientes → Ley 25.326 (Argentina), LGPD (Brasil) y LFPDPPP (México), considerando los requisitos aplicables a transferencias y almacenamiento de datos. PCI-DSS de alcance reducido por delegar el pago. Riesgos: caída en un pico, pérdida de compras, filtración de datos y borrado o alteración maliciosa del material.

Objetivos: RTO ≤ 2 h · RPO ≤ 6 h (base de datos)

RTO objetivo ≤ 2 horas. Derivado del impacto de negocio: una tienda de cursos tolera recuperarse en un par de horas sin daño grave, ya que no es un servicio de misión crítica. El procedimiento contempla detectar el incidente, recuperar la base en la región DR, desplegar la infraestructura con IaC, levantar el cómputo, validar el servicio y redirigir el tráfico. El procedimiento se diseña para completarse dentro de las 2 horas.

RPO objetivo ≤ 6 horas para la base de datos. Este objetivo aplica principalmente a los datos de compras, que son los que cambian con mayor frecuencia. Se utilizan los backups automatizados de RDS y su copia cross-region para disponer de un punto de recuperación en la región DR, utilizando PITR cuando corresponda. El RPO efectivo dependerá de la frecuencia y disponibilidad de los backups/logs copiados a la región secundaria y deberá validarse mediante pruebas de recuperación.

Roversec no es un servicio de misión crítica y una caída regional es un evento excepcional. Se considera aceptable una ventana de pérdida potencial de datos de hasta 6 horas frente al costo y complejidad de una estrategia de replicación continua. Si el volumen de ventas aumentara o el negocio requiriera una recuperación más precisa, el RPO podría reducirse mediante una estrategia de replicación más frecuente.

Distinción por tipo de dato (decisión de diseño)

No todos los datos se protegen igual, porque no todos cambian igual:

Compras (RDS): cambian todo el tiempo → RPO ≤ 6 h con backups automatizados y copia cross-region. Es el dato crítico y el que define el RPO.

Material de cursos (S3): cambia con poca frecuencia, por lo que no necesita el mismo nivel de protección que las compras. Se protege con versionado y replicación cross-region, de modo que exista una copia disponible en la región DR. Cuando se actualiza un curso, la replicación copia el cambio.

Esta distinción permite mantener un diseño más eficiente en costos: el dato que requiere protección frecuente (compras) es relativamente pequeño, mientras que el material de cursos ocupa más espacio pero cambia con menor frecuencia.

Estrategia — Backup & Restore (con dependencias preposicionadas)

No mantengo cómputo encendido en la región secundaria. Mantengo los datos y artefactos necesarios para la recuperación y la infraestructura como código lista para desplegar. Esto reduce el costo frente a mantener un entorno de cómputo activo en DR, a cambio de un RTO objetivo de hasta 2 horas.

Región DR: Norte de Virginia (us-east-1) — decisión

Elegí us-east-1 como región DR por la disponibilidad de los servicios necesarios y por ser una región madura del ecosistema AWS, manteniendo un costo razonable para una estrategia de recuperación sin infraestructura de cómputo permanente.

Dado que la región primaria es São Paulo y no se dispone de una segunda región sudamericana equivalente para este diseño, us-east-1 implica que copias de determinados datos puedan residir fuera de Sudamérica. Esto introduce una consideración adicional respecto de las transferencias internacionales de datos, que deberá evaluarse conforme a la normativa aplicable (Ley 25.326, LGPD y LFPDPPP). Como medidas técnicas se utilizan cifrado en tránsito y en reposo y controles de acceso estrictos.

Failover del tráfico (procedimiento)

Punto importante: CloudFront no hace failover automático de origen para métodos POST (solo GET, HEAD y OPTIONS), y la compra es un POST. Por eso, el failover del tráfico dinámico es parte del runbook de DR y no automático. El procedimiento concreto es: (1) levantar la infraestructura en us-east-1 con IaC; (2) restaurar la base desde los backups replicados; (3) validar el servicio; (4) cambiar el origen de la API en CloudFront para apuntar al ALB de la región DR; (5) probar una compra de punta a punta; (6) declarar la recuperación. El frontend estático se sigue sirviendo desde CloudFront utilizando el bucket replicado como origen.

Escenarios de falla

Caída de AZ: detección automática → Multi-AZ (Fargate en ambas AZ + failover RDS) → impacto bajo → NO consume el DR regional (es HA, no DR).

Corrupción de datos: → point-in-time recovery → impacto alto.

Error humano (borrado): → versionado de S3 / restauración de backups → impacto alto.

Caída de región: → failover a us-east-1 (Backup & Restore + IaC) → impacto crítico → aplica RTO ≤ 2 h / RPO ≤ 6 h.

Backups

RDS: backups automatizados con transaction logs (habilitan PITR) y replicación cross-region; retención de 7 días. S3 material: versionado + replicación cross-region. Política coherente con el RPO ≤ 6 h de la base y con la estrategia Backup & Restore.
