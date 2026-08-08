# Pensamiento Arquitectónico y Disaster Recovery (DR)

## 1. Usuarios y Disponibilidad

**¿Quiénes usan la app y en qué horarios?**

- **Público general (Adoptantes):** Acceden a las _landing pages_ públicas 24/7. Los picos de tráfico suelen darse durante los fines de semana o en las tardes/noches (fuera del horario laboral), especialmente si un refugio viraliza una mascota en redes sociales.
- **Usuarios internos (Refugios):** Administran el sistema principalmente durante el día y los fines de semana (cuando suelen realizarse jornadas de adopción).

**Ventanas de mantenimiento e Impacto:**

- Al utilizar una arquitectura _Serverless_ (AWS Lambda, API Gateway), los despliegues de nuevas versiones se realizan sin tiempo de inactividad (_zero-downtime deployments_). Sin embargo, si se requiere una migración compleja de datos, la ventana ideal de mantenimiento es durante la madrugada (ej. 3:00 AM - 5:00 AM).
- **Impacto de una caída en horario pico:** El impacto financiero directo es bajo (es una plataforma para ONGs), pero el impacto reputacional es alto. Una caída durante una campaña de adopción masiva o un evento presencial frustraría a los usuarios y limitaría las oportunidades de encontrar hogar para los animales.

## 2. Riesgos y Reglas

**Regulaciones y Compliance:**

- **Privacidad de Datos:** La plataforma procesa Formularios de Adopción que contienen Información de Identificación Personal (PII) de los postulantes (nombres completos, teléfonos, direcciones, DNI). Esto exige cumplir con normativas de protección de datos (como la Ley de Protección de Datos Personales en Argentina). Se mitiga asegurando el tráfico con HTTPS, no exponiendo la base de datos a internet (solo acceso vía IAM) y protegiendo los endpoints con Cognito.

**Riesgo Identificado:**

- **Riesgo Técnico:** Borrado accidental de datos críticos (perfiles de refugios o animales) por error humano de un administrador, o un ataque de denegación de servicio (DDoS) a una _landing_ viral.

## 3. Plan de Recuperación (Disaster Recovery)

Para este MVP, las métricas de recuperación se han definido buscando un equilibrio entre la continuidad del negocio y la optimización extrema de costos:

- **RTO (Recovery Time Objective):** 4 a 8 horas. Como no es un sistema financiero crítico, el negocio puede tolerar estar fuera de línea unas horas mientras se restaura la infraestructura.
- **RPO (Recovery Point Objective):** 24 horas. En el peor de los casos, la pérdida de un día de formularios de adopción requeriría que los refugios pidan a los postulantes recientes que vuelvan a completar el formulario.

**Estrategia de DR Seleccionada: Backup & Restore (Copia de seguridad y restauración)**
Dadas las restricciones de presupuesto de un SaaS para ONGs, implementar estrategias como _Pilot Light_, _Warm Standby_ o _Multi-Site_ (Activo-Activo) generaría costos fijos altísimos e injustificados para esta etapa. La estrategia _Backup & Restore_ es la más adecuada.

**Ejecución de la estrategia y Backups:**

1.  **Escenario: Error humano (Corrupción o borrado de datos en la base de datos).**
    - **Acción:** Se habilitará **Point-in-Time Recovery (PITR)** en Amazon DynamoDB. Esto permite restaurar la tabla a cualquier segundo exacto de los últimos 35 días, mitigando al instante borrados accidentales sin necesidad de programar _cron jobs_ de backup manuales.
2.  **Escenario: Caída total de una Región de AWS (ej. `us-east-1` offline).**
    - **Estado actual de la infraestructura:** En esta etapa de MVP, el proyecto utiliza un modelo híbrido. El cómputo y ruteo (Lambdas y API Gateway) están automatizados como código (IaC) en `serverless.yml`. Sin embargo, los recursos de estado, almacenamiento e identidad (DynamoDB, S3 y Cognito) fueron provisionados manualmente desde la consola de AWS.
    - **Acción de recuperación (Manual + IaC):**
      1. Recrear manualmente desde la consola de AWS en la nueva región (ej. `us-east-2`) el User Pool de Cognito, las tablas de DynamoDB y los buckets de S3.
      2. Actualizar las variables de entorno (IDs, ARNs) en el código.
      3. Ejecutar `serverless deploy` para levantar la API y las Lambdas en la nueva región.
      4. Restaurar los datos de DynamoDB mediante AWS Backup.
    - **Evolución del Plan (Mejora técnica):** Debido a que la creación manual aumenta nuestro RTO (Tiempo de Recuperación) a varias horas y es propenso a errores humanos bajo presión, el próximo hito arquitectónico es migrar la definición de DynamoDB, Cognito y S3 al bloque `resources` del `serverless.yml`. Esto permitirá alcanzar una infraestructura 100% IaC y reducir el failover regional a un solo comando.
