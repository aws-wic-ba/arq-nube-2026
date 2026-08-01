# 05 — Estimación de costos

## Servicios más costosos

| Servicio | Costo estimado/mes | Notas |
|----------|--------------------|-------|
| RDS MySQL (db.t4g.medium, Multi-AZ) | ~$80 | El componente más caro, garantiza consistencia y alta disponibilidad |
| ECS Fargate (0.5 vCPU, 1 GB) | ~$15 | Escala a cero fuera de horario, ideal para restaurantes con horarios definidos |
| ALB | ~$20 | Costo fijo + por LCU, distribuye tráfico entre contenedores |
| NAT Gateway | ~$35 | Caro para tráfico saliente — evaluar si es necesario en producción |
| CloudWatch Logs | ~$5 | Depende del volumen de logs y métricas |

**Total estimado:** ~$155/mes para una carga pequeña

---

## Decisiones de optimización tomadas

- **Fargate Spot en staging:** ahorro del ~70% en entornos que no son producción.  
- **Instancias arm64 (t4g):** ~20% más baratas con igual o mejor performance.  
- **S3 Glacier para backups viejos:** reducción de costos de almacenamiento a largo plazo.  
- **Auto scaling:** reduce la capacidad fuera del horario de uso (ejemplo: madrugada o días de baja demanda).  

---

## Lo que evitaríamos en una primera versión

- **NAT Gateway en staging:** en entornos de prueba, se puede asignar IP pública a los contenedores directamente para evitar ~$35/mes.  
- **Multi-AZ en staging:** solo necesario en producción.  
- **CloudFront en desarrollo:** agregar únicamente cuando se necesite escala geográfica o distribución global.  

---

## Herramienta recomendada

Usar la [AWS Pricing Calculator](https://calculator.aws/) para estimar costos con los valores reales de la arquitectura y ajustar según el tráfico esperado del restaurante.

