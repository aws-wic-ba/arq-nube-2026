

# 06 — Disaster Recovery (DR) y Resiliencia

## Estrategia de Backup

* **Amazon DynamoDB:**
* **Point-In-Time Recovery (PITR):** Habilitado para permitir la recuperación continua de la base de datos a cualquier segundo dentro de los últimos 35 días ante eliminaciones o corrupciones accidentales de datos.
* **Backups bajo demanda (On-Demand Backups):** Programados periódicamente mediante **AWS Backup** antes de cada despliegue relevante o cambio de esquema.


* **Código e Infraestructura:**
* Toda la infraestructura está definida como código (IaC) mediante **AWS SAM / Terraform**, almacenada y versionada en GitHub, lo que permite recrear todo el entorno en una nueva región en cuestión de minutos.



---

## RTO y RPO Objetivos

* **RTO (Recovery Time Objective):** $< 30 \text{ minutos}$
* *Tiempo máximo aceptable de inactividad:* Al ser una arquitectura Serverless multizona (Multi-AZ de forma nativa), los servicios se recuperan automáticamente ante fallas de una zona de disponibilidad. La recreación completa en otra región toma menos de 30 minutos vía IaC.


* **RPO (Recovery Point Objective):** $< 5 \text{ minutos}$
* *Pérdida máxima de datos aceptable:* Gracias al Point-In-Time Recovery (PITR) de DynamoDB, el punto de restauración es prácticamente inmediato (segundos).



---

## Estrategia de Recuperación ante Desastres

Se aplica la estrategia **Backup and Restore** (o *Pilot Light* para alta disponibilidad):

1. **Monitoreo y Detección:** **Amazon CloudWatch** detecta fallas críticas en la región principal (`us-east-1`).
2. **Re-despliegue de Infraestructura:** Se ejecuta el pipeline de CI/CD para desplegar la plantilla IaC en la región secundaria (ej. `us-west-2`).
3. **Restauración de Datos:** Se restaura la tabla de DynamoDB desde la última copia de seguridad PITR o AWS Backup hacia la nueva región.
4. **Conmutación por Error (Failover):** Se actualizan los registros de DNS en **Amazon Route 53** (o la configuración de **Amazon CloudFront**) para apuntar el tráfico del frontend y API Gateway a la nueva región.

---

## Pruebas y Simulacros

* **Frecuencia:** Simulacros de recuperación semestrales en un entorno de staging/prueba.
* **Procedimiento:** Recreación automatizada de la pila completa mediante scripts de despliegue y validación de la integridad de los datos de inventario y ventas restaurados.