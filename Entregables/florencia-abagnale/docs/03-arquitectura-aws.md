# 03 — Propuesta de infraestructura AWS

## Diagrama

[Arquitectura AWS](../diagrams/arquitectura-aws.png)

Hice el mismo diagrama de arqutectura pero con dos herramientas diferentes. Una fue hecha con Lucidchart y 
la otra versión con la librería `diagrams` de Python, generada por
código en vez de a mano — la dejo como referencia adicional en
[`diagrams/arquitectura-aws-1.png`](../diagrams/arquitectura-aws-1.png).

## Cómo funciona

Azure AD exporta los usuarios y roles a un bucket S3. Eso dispara una
Lambda que clasifica cada rol (¿está inactivo? ¿es privilegiado y no
tiene MFA?). Los roles limpios se guardan en S3 y en DynamoDB queda el
registro de la corrida. Los roles con problemas generan un ticket en
Jira para que alguien los revise a mano — el sistema nunca borra ni
modifica accesos por su cuenta.

Toda la parte de PAM (CyberArk) es a futuro: hoy el JSON queda listo
en S3, pero todavía no hay ninguna integración real armada.

## Servicios usados y por qué

| Servicio | Para qué |
|---|---|
| **Lambda** | Corre el motor de clasificación. Se activa sola cuando llega un archivo nuevo a S3, así que es útil para no pagar por un servidor prendido todo el día. |
| **VPC + NAT + Internet Gateway** | La Lambda vive en una red privada. Solo el llamado a Jira sale a internet, y sale por un camino controlado (NAT), no directo. |
| **S3** | Guarda el archivo que llega de Azure AD y los resultados (roles limpios + reporte). |
| **DynamoDB** | Guarda el historial: cuándo se corrió, cuántos roles quedaron ok, cuántos se mandaron a revisar. Elegí DynamoDB porque no pago por una base prendida todo el tiempo, y acá no necesito relaciones complejas entre tablas. |
| **Secrets Manager + KMS** | El token de Jira no está escrito en ningún lado del código. La Lambda lo pide en el momento, cifrado. |
| **IAM** | Cada rol tiene permisos justos para lo que necesita tocar, nada más. |
| **CloudWatch + SNS** | Si algo falla, no me entero solo yo mirando logs: se dispara una alarma que le avisa al equipo de seguridad. |
| **SQS (Dead Letter Queue)** | Si la Lambda falla a mitad de camino, el evento no se pierde — queda guardado para revisarlo después. |
| **API Gateway + WAF (a futuro)** | Cuando haya un PAM real conectado, va a consumir los datos por acá, con autenticación, no accediendo directo al bucket. |

## Lo que decidí dejar afuera (por ahora)

- Conexión real con CyberArk u otro PAM — hoy solo dejo el formato de
  datos listo para que lo consuman en el futuro.
- Integración con Jira, es simulada.
