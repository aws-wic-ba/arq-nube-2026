# 04 — AWS Well-Architected Framework

Evalué la arquitectura contra los pilares que más aplican a EcoCanje en su etapa de MVP: **Seguridad**, **Fiabilidad**, **Optimización de Costos** y **Excelencia Operativa**.

---

## Seguridad

**Decisiones tomadas:**
- Credenciales de la base de datos en Secrets Manager, nunca en el código
- RDS en subnet privada: la base no es accesible desde internet, solo desde la app
- HTTPS obligatorio en el ALB con certificado de ACM
- Cada perfil (municipio, vecino, emprendedor) ve solo lo que le corresponde: el municipio administra únicamente su territorio

**Qué mejoraría:** agregar WAF frente al ALB para frenar ataques comunes (por ejemplo inyección SQL), y activar MFA para las cuentas de administrador de los municipios.

---

## Fiabilidad

**Decisiones tomadas:**
- ALB con health checks: si el contenedor de la app no responde, deja de recibir tráfico
- ECS mantiene la cantidad deseada de tareas: si el contenedor se cae, levanta otro solo
- RDS con backups automáticos diarios y point-in-time recovery (los backups se guardan en S3, en almacenamiento administrado por AWS)

**Qué mejoraría:** habilitar Multi-AZ en RDS para que la base tenga una copia en otra zona de disponibilidad y haga failover automático.

---

## Optimización de Costos

**Decisiones tomadas:**
- ECS Fargate en vez de App Runner: ~50-60% menos por hora de cómputo con carga sostenida 24/7
- Una sola tarea de Fargate chica para el MVP: se escala recién cuando haga falta
- RDS single-AZ en instancia chica para arrancar

**Qué mejoraría:** con carga estable y predecible, contratar un Savings Plan de Fargate (ahorro de hasta ~20-50% comprometiendo uso por 1 año).

---

## Excelencia Operativa

**Decisiones tomadas:**
- Logs de la app centralizados en CloudWatch Logs
- Alarma en CloudWatch si la app devuelve muchos errores 5xx
- La misma imagen Docker corre local y en AWS: lo que pruebo localmente es lo que se despliega
