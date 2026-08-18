# 04 — AWS Well-Architected Framework

## Seguridad

**Decisiones tomadas:**

- Credenciales de la base de datos en Secrets Manager, nunca en el código
  ni en variables de entorno en texto plano (hoy, en la versión local, el
  `SECRET_KEY` y las credenciales de Postgres están hardcodeadas en el
  `docker-compose.yml` — esto es justamente lo que se resuelve al migrar
  a AWS).
- RDS en subnet privada, sin acceso directo desde internet.
- HTTPS obligatorio con certificado de ACM en el ALB.
- La lógica de roles (padre/madre vs. adolescente) ya existe en la app
  —`is_parent()` / `is_teen()`— y se mantiene igual en AWS: cada acción
  sensible (aprobar, rechazar) valida tanto el rol como que el padre sea
  dueño de esa solicitud puntual.

**Qué mejoraríamos:**

- Agregar WAF frente al ALB, para protección contra ataques comunes como
  SQL injection — relevante en nuestro caso porque los formularios de
  solicitud (`item`, `link_or_note`, etc.) llegan directo a queries de
  SQLAlchemy.

## Fiabilidad

**Decisiones tomadas:**

- ECS Fargate con al menos 2 tasks repartidas en 2 AZs distintas: si una
  zona tiene un problema, la otra sigue respondiendo.
- ALB con health checks, que saca de circulación automáticamente
  cualquier task que deje de responder.
- RDS con backups automáticos habilitados (retención configurable, por
  ejemplo 7 días).

**Qué mejoraríamos:**

- Sumar pruebas de recuperación periódicas: restaurar un snapshot en un
  entorno aparte y verificar que los datos de `PurchaseRequest` y
  balances de los adolescentes sean correctos para no tener que confiar en que
  el backup "está ahí".
- Para la V1 se utilizaria solo 1 task de Fargate para achicar costos y recién a futuro como mejora 
  implementaría las 2 tasks en 2 Availability Zones (AZs) detrás del ALB.


## Eficiencia de Rendimiento

**Decisiones tomadas:**

- Fargate permite escalar sin gestionar servidores ni tener que
  planificar capacidad de antemano.

**Qué mejoraríamos:**

- Sumar ElastiCache (Redis) para cachear datos que se consultan todo el
  tiempo, como el saldo del adolescente
  (`current_user.balance`) y las métricas mensuales del dashboard de los
  padres (`build_metrics()`).