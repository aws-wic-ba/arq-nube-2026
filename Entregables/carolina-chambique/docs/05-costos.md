# 05 — Estimación de costos

## Alcance de la estimación

Esta estimación corresponde a una versión pequeña de CloudDesk desplegada en la región `us-east-1`.

Los valores están expresados en dólares estadounidenses por mes y son aproximados. El costo real puede cambiar según la región, la cantidad de usuarios, las descargas, el almacenamiento, los impuestos y las tarifas vigentes de AWS.

Antes de realizar un despliegue real utilizaría AWS Pricing Calculator para actualizar los valores.

La estimación supone:

- 50 usuarios.
- Uso principalmente durante actividades universitarias y proyectos.
- 10 GB iniciales de documentos.
- Tráfico moderado.
- Dos tareas pequeñas de ECS Fargate en producción.
- Amazon RDS PostgreSQL Multi-AZ.
- Backups y monitoreo básico.

## Estimación mensual

| Servicio | Supuesto | Costo mensual aproximado |
|---|---|---:|
| ECS Fargate | Dos tareas pequeñas con 0,25 vCPU y 0,5 GB de memoria | USD 14 |
| Application Load Balancer | Funcionamiento durante todo el mes y tráfico bajo | USD 18–22 |
| Amazon RDS PostgreSQL | Instancia pequeña Multi-AZ y almacenamiento inicial | USD 30–45 |
| NAT Gateway | Un gateway y poco tráfico | USD 33–38 |
| Amazon S3 | 10 GB, versionado y pocas solicitudes | Menos de USD 1 |
| CloudFront y Route 53 | Poco tráfico de salida y una zona DNS | USD 3–5 |
| CloudWatch, Secrets Manager, KMS, ECR y WAF | Logs contenidos y configuración básica | USD 12–20 |
| **Total estimado** | Arquitectura productiva pequeña | **USD 110–145 por mes** |

## Servicios más costosos

Los componentes que más influyen en el costo son:

### Amazon RDS Multi-AZ

RDS Multi-AZ mantiene una instancia secundaria en otra zona de disponibilidad. Esto aumenta el costo, pero permite realizar un failover si la instancia principal tiene problemas.

Para mí esta disponibilidad es importante porque los metadatos permiten encontrar y relacionar los documentos almacenados en S3.

### NAT Gateway

El NAT Gateway permite que los contenedores ubicados en subredes privadas accedan a servicios externos sin quedar expuestos directamente a Internet.

Aunque aporta seguridad y aislamiento, tiene un costo fijo mensual importante para una aplicación pequeña.

### Application Load Balancer

El Load Balancer distribuye las solicitudes entre las tareas de ECS y realiza healthchecks. Su costo puede resultar significativo cuando la aplicación tiene pocos usuarios, pero permite mejorar la disponibilidad.

## Decisiones para optimizar costos

CloudDesk comienza como una aplicación para estudiantes y equipos pequeños. Por eso no utilizaría desde el primer día todos los componentes de una arquitectura empresarial.

Aplicaría las siguientes medidas:

1. Utilizar una sola tarea de ECS en el ambiente de desarrollo.
2. Usar RDS Single-AZ en desarrollo y Multi-AZ solamente en producción.
3. Ajustar CPU y memoria de Fargate según métricas reales.
4. Configurar AWS Budgets con alertas al alcanzar el 50 %, 80 % y 100 % del presupuesto.
5. Limitar la retención de logs de CloudWatch.
6. Eliminar automáticamente imágenes antiguas de Amazon ECR.
7. Mover archivos antiguos de S3 a clases de almacenamiento más económicas.
8. Revisar periódicamente snapshots y recursos sin uso.
9. Evaluar endpoints privados para acceder a S3 y reducir tráfico mediante NAT.
10. Analizar Savings Plans cuando el consumo sea estable.

## Primera versión más económica

Para una demostración o primera versión universitaria se podría utilizar:

- Una sola tarea de ECS Fargate.
- RDS PostgreSQL Single-AZ.
- Una cantidad reducida de logs.
- S3 sin CloudFront inicialmente.
- Reglas mínimas de WAF.
- Sin infraestructura activa en una segunda región.

Esta versión podría tener un costo aproximado de entre USD 35 y USD 60 por mes, dependiendo del uso.

Sin embargo, tendría menor disponibilidad y requeriría más tiempo para recuperarse ante una falla.

## Decisión personal

Mi prioridad sería mantener disponible la aplicación porque una caída afecta la experiencia y la confianza de los usuarios.

Sin embargo, como CloudDesk comienza como un proyecto universitario, elegiría primero una arquitectura más económica. A medida que crecieran la cantidad de usuarios y la importancia de los documentos, incorporaría Multi-AZ, más tareas de ECS y mejores mecanismos de recuperación.

De esta manera buscaría un equilibrio entre costo y disponibilidad, en lugar de pagar desde el principio por recursos que todavía no son necesarios.