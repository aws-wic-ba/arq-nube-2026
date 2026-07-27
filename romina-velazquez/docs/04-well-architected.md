# 04 — AWS Well-Architected Framework

## Excelencia Operativa

**Decisiones tomadas:**
- Logs centralizados en CloudWatch Logs con retención de 30 días
- Alarmas en CloudWatch si el error rate supera el 5%
- Deploys automáticos vía GitHub Actions actualizando la task definition en ECS

**Qué mejoraríamos:** dashboards en Grafana, runbooks documentados para incidentes frecuentes, y alertas por Slack.

---

## Seguridad

**Decisiones tomadas:**
- Credenciales de la base de datos en Secrets Manager (nunca en el código ni en variables de entorno en texto plano)
- Contenedores con IAM roles de mínimo privilegio
- RDS en subnet privada, sin acceso público desde internet
- HTTPS obligatorio con certificado de ACM

**Qué mejoraríamos:** agregar WAF frente al ALB para protección contra ataques comunes, y habilitar GuardDuty para detección de amenazas.

---

## Fiabilidad

**Decisiones tomadas:**
- RDS con Multi-AZ habilitado para failover automático ante caída de una AZ
- ECS Fargate con auto scaling basado en CPU
- ALB con health checks que sacan del pool las instancias que no responden

**Qué mejoraríamos:** Circuit Breaker en la capa de servicio para evitar cascadas de fallos, y tests de caos periódicos.

---

## Eficiencia de Rendimiento

**Decisiones tomadas:**
- Fargate para no gestionar servidores y escalar sin overhead operativo
- RDS en instancias `t4g.medium` (arm64) por mejor relación precio/performance
- CloudFront para cachear assets estáticos y reducir carga en la app

**Qué mejoraríamos:** agregar ElastiCache (Redis) para cachear los turnos disponibles y reducir consultas a la base de datos en horarios pico.

---

## Optimización de Costos

**Decisiones tomadas:**
- Fargate Spot para el entorno de staging (~70% de ahorro)
- Instancias `t4g` (arm64) ~20% más baratas que sus equivalentes x86
- S3 Lifecycle Policies para mover backups viejos a Glacier después de 30 días
- CloudFront reduce los requests que llegan a los contenedores

**Qué mejoraríamos:** revisar si el ALB y NAT Gateway son necesarios o si con API Gateway + Lambda resultaría más barato para el volumen actual.

---

## Sostenibilidad

**Decisiones tomadas:**
- Región us-east-1 por ser una de las que tiene mayor porcentaje de energía renovable en AWS
- Fargate evita instancias EC2 ociosas: los recursos se usan solo cuando hay carga real
- Auto scaling reduce la capacidad en horarios de baja demanda

**Qué mejoraríamos:** activar el AWS Customer Carbon Footprint Tool para medir y reportar la huella de carbono del sistema.
