# 04 — AWS Well-Architected Framework

## Excelencia Operativa

**Decisiones tomadas:**
- Despliegues automatizados mediante Terraform sincronizado en GitHub, utilizando AWS Lambda para una ejecución estandarizada.

**Qué mejoraríamos:** implementar logs y alertas en CloudWatch 
---

## Seguridad

**Decisiones tomadas:**
- Cifrado en reposo (S3 y Neon)
- Control de accesos estricto con IAM
- RDS en subnet privada, sin acceso público desde internet
- Habilitar el versionado

**Qué mejoraríamos:** agregar WAF 

---

## Fiabilidad

**Decisiones tomadas:**
- Despliegue de Neon (con alta disponibilidad nativa multi-AZ) y AWS Lambda para failover automático ante caída de una zona
- Uso de Amazon CloudFront como capa de CDN para mitigar ataques de denegación de servicio (DDoS) antes de que el tráfico llegue al backend

**Qué mejoraríamos:** Implementar pruebas de fallos

---

## Eficiencia de Rendimiento

**Decisiones tomadas:**
- Uso de arquitectura totalmente serverless (Lambda y Neon) para un escalado elástico e instantáneo ante picos de tráfico.
- CloudFront para cachear assets estáticos y reducir carga en la app

**Qué mejoraríamos:** Añadir caché en memoria (Amazon ElastiCache / Redis) para agilizar consultas frecuentes de eventos

---

## Optimización de Costos

**Decisiones tomadas:**
- Con Lambda y Neon se paga exclusivamente lo que se consume, y uso de CloudFront para reducir costos de transferencia.

**Qué mejoraríamos:** Configurar alertas de presupuesto (AWS Budgets) y políticas de ciclo de vida avanzadas en S3.

---

## Sostenibilidad

**Decisiones tomadas:**
- Región us-east-1 por ser una de las que tiene mayor porcentaje de energía renovable en AWS
- Minimización de recursos ociosos mediante servicios gestionados serverless que solo consumen energía al procesar peticiones.

**Qué mejoraríamos:** Analizar métricas detalladas de huella de carbono con AWS Customer Carbon Footprint Tool y optimizar la eficiencia del código.
