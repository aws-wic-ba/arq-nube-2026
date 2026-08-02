# 01 — Descripción de la aplicación

## ¿Qué hace la app?
Motor de migración y auditoría de identidades: toma un export de
usuarios y roles de Azure AD / Microsoft Entra ID y lo clasifica
según criterios de mínimo privilegio y recertificación de accesos
(inactividad, tipo de rol, MFA habilitado). Los roles que cumplen
los criterios quedan listos para provisioning en AWS; los que no,
se escalan como ticket a Jira para revisión manual de un analista
de seguridad — el script nunca elimina ni modifica accesos por su
cuenta. Además genera un reporte de auditoría con trazabilidad a
controles de ISO 27001 y PCI-DSS.

## ¿Por qué la elegí?
Me interesa la ciberseguridad y roles como IAM/PAM analyst; acabo
de terminar mi certificación de Auditora Interna ISO 27001 y quise
cruzar esos conceptos con lo visto en el curso de arquitectura,
usando scripting básico y controles concretos. Se suma una
necesidad real que me planteó un compañero de la facultad: migrar
identidades de Azure a AWS y el trabajo manual que implica mapear
servicios, roles y grupos entre ambos proveedores. Fue una forma de
integrar lo que vengo estudiando estos meses (compliance, AML,
fintechs) en un proyecto concreto, resolviendo un dolor real —
migrar de un directorio a otro sin eliminar accesos sin revisión
humana de por medio.

## ¿A quién está dirigida?
Analistas de seguridad/GRC y oficiales de cumplimiento de una
entidad financiera o fintech que necesitan auditar y recertificar
accesos como parte de una migración de identidades entre
proveedores de nube.

## Base de datos: DynamoDB
Sí incorporo una base de datos, pero acotada a metadata de
auditoría, no a los reportes completos (esos viven en S3). Elegí
DynamoDB en vez de una base relacional porque el patrón de acceso
es simple (una corrida = un registro, consultas por fecha o por
estado) y porque, al ser serverless, no pago por una instancia
encendida 24/7 — coherente con el resto de la arquitectura basada
en Lambda. Diferencié esto de CloudWatch a propósito: CloudWatch
me sirve para logs operativos de corta vida (debugging, alertas),
mientras que la tabla de auditoría es el registro de negocio que
necesito conservar y poder consultar para una auditoría de
ISO 27001 o PCI-DSS.
