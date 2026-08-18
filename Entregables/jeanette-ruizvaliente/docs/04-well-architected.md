# 04 — AWS Well-Architected Framework

Cubro los pilares que más se aplican a esta arquitectura.

## Excelencia Operativa

**Decisiones tomadas:**
- Imagen Docker versionada en ECR — cada deploy es una imagen inmutable, no
  un "parche" sobre el contenedor anterior
- Logs centralizados en CloudWatch Logs
- Task definitions de ECS actualizadas vía pipeline, no manualmente

**Qué mejoraría con más tiempo/presupuesto:** dashboards de negocio (no solo
técnicos) — por ejemplo, un panel para que un Customer Success Lead vea
cuántas cuentas pasaron a rojo esta semana sin tener que abrir CloudWatch.

## Seguridad

**Decisiones tomadas:**
- Separo la ruta pública (`/valorar/<id>`) de las rutas internas del
  dashboard: la pública queda detrás de WAF, la interna detrás de login con
  Cognito
- RDS en subnet privada, sin IP pública
- Credenciales de base de datos en Secrets Manager, nunca en el código
- HTTPS obligatorio (ACM) — no es opcional cuando el formulario público le
  pide una opinión a un cliente externo

**Qué mejoraría:** rate limiting explícito en el formulario público (regla de
WAF: si una misma IP manda más de 100 requests en 5 minutos, se bloquea por
una hora), sumado a un reCAPTCHA en el formulario para filtrar bots antes de
que lleguen a la app.

## Fiabilidad

**Decisiones tomadas:**
- RDS Multi-AZ: si se cae una zona de disponibilidad, no se cae el acceso a
  los datos de mis clientes
- ALB con health checks, saca del pool cualquier tarea de ECS que no responda
- Fargate con auto scaling básico por CPU

**Qué mejoraría:** definir alarmas automáticas que avisen apenas una tarea
de ECS empieza a fallar repetidamente, en vez de enterarme porque un
Account Manager reporta que el dashboard no carga.

## Eficiencia de Rendimiento

**Decisiones tomadas:**
- Fargate en vez de EC2: no dimensiono servidores a mano, escala con la carga
  real (que en un dashboard de AM es predecible: picos en horario de oficina)
- CloudFront cachea los estáticos, así Fargate se dedica solo a lógica de
  negocio, no a servir CSS

**Qué mejoraría:** cachear en memoria (ElastiCache/Redis) el cálculo de
"salud general de la cartera" — hoy se recalcula en cada carga del
dashboard; con más cuentas, conviene cachearlo unos minutos.

## Optimización de Costos

**Decisiones tomadas:**
- Fargate (pago por uso real) en vez de reservar instancias EC2 que quedarían
  libres fuera del horario comercial — un dashboard de account management
  no se usa 24/7, se usa en horario de oficina
- Un solo motor de base de datos (RDS) en vez de sumar un caché o motores
  adicionales que hoy no se justifican por el volumen de datos

**Qué mejoraría:** activar Auto Scaling de almacenamiento en RDS en vez de
reservar de más "por las dudas" — así solo pago por el espacio que la base
realmente va necesitando con el tiempo.

