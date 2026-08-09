# Estrategia de Disaster Recovery (DR) y Resiliencia

Este documento detalla el análisis de riesgo, continuidad de negocio y el plan de recuperación ante desastres para la plataforma **Ghirba Travel**, asegurando el cumplimiento de los objetivos de disponibilidad con un enfoque costo-eficiente.

---

## 1. Perfil de Usuarios y Ventana de Mantenimiento

### ¿Quiénes usan la app?
* **Clientes / Público General:** Acceden al catálogo de paquetes, consultan itinerarios y realizan reservas.
* **Agentes / Empleados Internos:** Gestionan inventario, precios y confirmaciones de pago.

### Horarios de Uso e Impacto
* **Pico de Tráfico:** 9:00 a 22:00 hs (Horario local - Argentina/Sudamérica).
* **Ventana de Mantenimiento Sugerida:** **02:00 a 05:00 hs (GMT -3)**, momento donde se estima que dada la ubicación geográfica de los usuarios, el número de visitas cae. 
* **Impacto si la App cae en Horario Pico:**
  * *Económico:* Pérdida directa de reservas y pagos en proceso.
  * *Reputacional:* Desconfianza del usuario final en la plataforma de viajes.
  * *Operativo:* Retraso en la confirmación manual por parte de agentes internos. Retraso en la comunicación con los operadores mayoristas o aerolíneas, alojamientos, transporte y excursiones, según corresponda. 

---

## 2. Riesgos Técnicos, Negocio y Regulaciones

### Regulaciones y Compliance
**Ley de Protección de Datos Personales (Ley 25.326 - Argentina):** Encriptación en tránsito (TLS 1.3 via CloudFront/ALB) y en reposo (AES-256 en Amazon RDS y S3) para datos personales e historial de viajes.


### Matriz de Riesgos Identificados
* **Corrupción o borrado accidental de la base de datos** (Error humano/ciberataque).
* **Falla de Disponibilidad en la Availability Zone (AZ)** principal de AWS.
* **Inyección de código / Despliegue fallido** en el backend.

---

## 3. Métricas de Recuperación: RTO y RPO

Para un entorno **MVP/Inicial** optimizado en costos (~$43.10 USD/mes), se definen las siguientes metas:

    RPO: 24 Horas            │     RTO: 2 a 4 Horas
   (Pérdida Máx. Datos)      │   (Tiempo para Volver)

**| Métrica | Definición | Ghirba Travel (MVP) | Justificación de Arquitectura |**

| **RPO** *(Recovery Point Objective)* | Cantidad máxima de datos retenidos/perdidos tras una falla. | **< 24 Horas** (Snapshots diarios) / **~5 Minutos** si se activa Point-in-time Restore. |
El Point-In-Time Restore (PITR) es una de las funcionalidades más potentes que tiene Amazon RDS. Te permite restaurar tu base de datos a cualquier segundo específico dentro de un período de retención. 

En vez de volver al backup diario de las 3:00 AM y perder todo el trabajo del día, con PITR podés decir: "La base de datos se rompió o un script erróneo borró tablas a las 14:32:10 hs, restaurame una base limpia a las 14:32:09 hs".

 Los backups automáticos diarios de RDS aseguran la foto del día anterior. 

| **RTO** *(Recovery Time Objective)* | Tiempo total tolerado para restablecer el servicio. | **< 2 a 4 Horas** | Tiempo necesario para aprovisionar infraestructura limpia via IaC (Infraestructura como código) / desplegar contenedores Fargate en una nueva AZ (Zona de Disponibilidad) o Región. |

---

## 4. Estrategia de DR Seleccionada: *Backup & Restore* 

Dado que el modelo actual prioriza el control de costos frente a una infraestructura multi-región activa (que triplicaría el presupuesto), se selecciona la estrategia de **Backup & Restore**:

### Plan de Acción por Escenario de Falla:

#### 🟢 Escenario A: Caída de una Availability Zone (AZ) en `us-east-1`
* **Acción:**
  1. El **Application Load Balancer (ALB)** detecta la falla en la AZ afectada.
  2. **AWS Fargate** redirige y levanta automáticamente las tareas/contenedores en la AZ secundaria dentro de la misma región.
* **Tiempo estimado de recuperación:** < 5 minutos (Automático).

#### 🟡 Escenario B: Corrupción de Datos o Error Humano en PostgreSQL
* **Acción:**
  1. Restauración de la instancia de **Amazon RDS** utilizando el último **Automated Backup** o la función *Point-In-Time Restore (PITR)* hacia una nueva base de datos.
  2. Cambio de la variable `DATABASE_URL` en **AWS Secrets Manager**.
  3. Reinicio de las tareas en ECS Fargate para apuntar a la base de datos sana.
* **Tiempo estimado de recuperación:** 30 a 60 minutos.

#### 🔴 Escenario C: Desastre Regional Completo (Caída total de `us-east-1`)
* **Acción:**

  1. Ejecución de scripts de AWS CLI / Plantillas de AWS CloudFormation para re-crear la infraestructura base (Clúster Fargate, ALB y RDS) en la región de respaldo (sa-east-1 o us-west-2).
  2. Restauración del snapshot de Amazon RDS exportado entre regiones.
  3. Actualización de la configuración del origen en Amazon CloudFront (o cambio de registros en el proveedor de DNS/dominio) para redirigir el tráfico hacia el nuevo ALB de la región de respaldo.
*  **Tiempo estimado de recuperación: 2 a 4 horas.**

---

##  5. Política y Mecanismos de Backup

1. **Amazon RDS PostgreSQL:**
   * **Automated Backups:** Habilitados con un período de retención de **7 días** (Costo $0 por estar dentro del almacenamiento de RDS asignado).
   * **Snapshots Diarios:** Programados a las 03:00 AM (Ventana de mantenimiento).
2. **Amazon S3 (Frontend):**
   * **Versioning (Control de versiones):** Activado en el bucket de S3 para recuperar versiones previas del build de React ante sobrescrituras erróneas.

