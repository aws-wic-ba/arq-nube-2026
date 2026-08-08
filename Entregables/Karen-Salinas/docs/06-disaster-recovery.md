# 06 — Plan de recuperación ante desastres

Dado que la plataforma se encuentra en fase de lanzamiento, operamos en **una sola región**, maximizando la resiliencia mediante los mecanismos nativos de alta disponibilidad de AWS sin duplicar costos fijos:

* **Alta Disponibilidad Interna (Multi-AZ):** 
  * **AWS Lambda:** Se distribuye automáticamente en múltiples Zonas de Disponibilidad (AZs). Si una AZ falla, el tráfico se redirige al instante.
  * **Neon (PostgreSQL Serverless):** Replica automáticamente los datos en múltiples AZs por debajo y levantando un nuevo nodo de cómputo en milisegundos si falla el nodo actual.
  * **Amazon S3:** Replica los archivos de forma síncrona en múltiples AZs dentro de la región.
* **Control de Versiones y Despliegue:** 
  * El código de las funciones Lambda y la configuración de infraestructura están sincronizados en un repositorio de GitHub y se gestionan mediante **Terraform**.

---

## 1. Métricas Objetivo
* **RTO (Recovery Time Objective):** Inmediato para fallos locales (segundos) / Variable (dependiente de AWS) ante caídas catastróficas de región completa.
* **RPO (Recovery Point Objective):** Menor a 5 minutos (gracias a Point-in-Time Recovery de Aurora).

---

## 2. Estrategia de Backups y Respaldo de Datos
Para proteger los datos transaccionales (ventas de entradas y pagos):

  * **Neon (PostgreSQL Serverless):**
  * Backups Automáticos y Versionado: Respaldos continuos integrados gestionados de forma nativa por el servicio.
  * Point-in-Time Recovery (PITR): Permite restaurar la base de datos a un punto específico en el tiempo, asegurando un RPO mínimo.
* **Amazon S3:**
  * Versionado de objetos activado para prevenir eliminaciones accidentales o sobrescrituras de archivos críticos.

---

## 3. Procedimiento ante Fallos de Zonas de Disponibilidad (AZ) o Componentes Locales
* **Fallo de una AZ:** No requiere acción humana. AWS y Aurora redirigen automáticamente las cargas de trabajo a las AZs sanas.
* **Fallo de Código o Bug Crítico:** Se revierte el despliegue anterior directamente desde el historial de versiones en GitHub/Terraform o se actualiza la función Lambda afectada.