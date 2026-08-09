# 04 — AWS Well-Architected Framework

## Propósito

Este documento evalúa la arquitectura AWS target de Secure Design Advisor aplicando los seis pilares del AWS Well-Architected Framework y consideraciones de la Serverless Applications Lens.

La aplicación genera evaluaciones de seguridad sobre arquitecturas de terceros (STRIDE, Zero Trust, Gate). Este documento, en cambio, evalúa la propia arquitectura de la herramienta como sistema cloud.

## Resumen ejecutivo

| Pilar | Estado | Fortaleza principal | Gap principal |
|-------|--------|--------------------|----|
| Operational Excellence | 🟡 Parcial | Infraestructura como código y workflow explícito | Sin deployment real ni automatización de despliegue |
| Security | 🟡 Parcial | Mínimo privilegio y acceso privado a S3 | Sin autenticación de usuarios ni protección de API |
| Reliability | 🟡 Parcial | Servicios administrados y manejo de errores | Sin pruebas E2E en AWS ni multi-región |
| Performance Efficiency | ✅ Alineado | Serverless ajustado a un workload corto | Sin métricas reales de latencia |
| Cost Optimization | ✅ Alineado | Pago por uso completo, sin recursos ociosos | Costos aún por estimar formalmente |
| Sustainability | ✅ Alineado | Recursos bajo demanda que escalan a cero | Sin medición de utilización |

---

## Operational Excellence

### Lo que ya se resuelve bien

La infraestructura completa está definida como código en un template SAM con 15 recursos. El workflow de análisis está documentado paso a paso en ASL, incluyendo sus entradas, salidas y caminos de error. El motor de dominio se prueba de forma independiente al runtime con 159 tests automatizados. Los logs del Express Workflow están configurados con nivel ALL para capturar cada transición de estado. El script `prepare_layer.py` permite reproducir artefactos de forma determinista.

### Lo que falta

No existe un pipeline de CI/CD, por lo que el deployment depende de ejecución manual. Las herramientas `sam build` y `sam validate` no se han ejecutado porque requieren SAM CLI. No hay alarmas configuradas en CloudWatch — únicamente logs. Tampoco existen runbooks ni dashboards operacionales.

### Qué mejoraría con más tiempo

Un pipeline automatizado con `sam deploy`, alarmas ante errores de workflow o latencia elevada, y un dashboard operacional básico.

---

## Security

### Lo que ya se resuelve bien

Cada rol IAM tiene únicamente los permisos estrictamente necesarios. Las Lambdas no pueden escribir en DynamoDB; esa responsabilidad es exclusiva de Step Functions. El bucket S3 del frontend es completamente privado, con Block Public Access habilitado y acceso solo mediante CloudFront Origin Access Control. Los contenedores locales ejecutan como usuario no-root. Las credenciales se manejan por variable de entorno, no en el código. DynamoDB y S3 utilizan encryption at rest con las claves administradas por AWS. Point-in-Time Recovery está habilitado.

### Lo que falta

La API no tiene autenticación de usuarios — cualquier request es procesado. No hay WAF ni rate limiting configurado en API Gateway. No se usa una clave KMS propia. No existen servicios de monitoring de seguridad como GuardDuty o Security Hub.

### Contexto

Para un entorno académico sin exposición pública real, estas brechas son aceptables. Si la aplicación se expone a Internet en producción, sería necesario agregar autenticación (Cognito), protección de API (WAF con rate-based rules) y eventualmente una CMK si requisitos regulatorios lo requieren.

---

## Reliability

### Lo que ya se resuelve bien

Toda la arquitectura utiliza servicios administrados sin servidores individuales que puedan fallar. Las funciones Lambda son stateless — una invocación siempre produce el mismo resultado con los mismos inputs. El workflow tiene caminos de error explícitos: si la validación falla, el request retorna HTTP 400 sin crear un registro. Si un error ocurre después de persistir el assessment, se actualiza el estado a FAILED y se retorna HTTP 500. ThreatAnalysis y RiskEvaluation tienen un retry automático antes de declarar fallo. DynamoDB tiene PITR habilitado para recuperar datos ante borrado accidental.

### Retries y error handling en el workflow

| Estado | Retry | Comportamiento ante error |
|--------|-------|---------------------------|
| Validate | No | Lanza ValidationError → falla sin persistir |
| ThreatAnalysis | 1 reintento | Si persiste el error → registra FAILED |
| RiskEvaluation | 1 reintento | Si persiste el error → registra FAILED |
| BuildResult | No | Error → registra FAILED |

### Lo que falta

No se ha ejecutado la arquitectura en AWS, por lo que no existen pruebas de fallo reales. La solución opera en una sola región. No hay chaos testing ni health checks externos. El detalle de recuperación ante desastres se desarrolla en [docs/06-disaster-recovery.md](./06-disaster-recovery.md).

---

## Performance Efficiency

### Lo que ya se resuelve bien

El análisis completo toma menos de 5 segundos, lo que hace que un Express Workflow síncrono sea la opción correcta. Lambda, DynamoDB on-demand y CloudFront eliminan la necesidad de provisionar capacidad. El frontend estático se distribuye desde edge locations con latencia mínima.

Se tomaron decisiones deliberadas para evitar complejidad sin beneficio:

| Decisión | Justificación |
|----------|---------------|
| No usar Map State | El volumen actual (6 componentes × 15 reglas = ~90 evaluaciones) completa en milisegundos. Paralelismo no aporta mejora perceptible. |
| Zero Trust dentro de Risk Evaluation | Ejecuta en aproximadamente 1ms. Una Lambda adicional solo agregaría overhead de invocación. |
| 4 Lambdas en lugar de 7 | Balance entre cohesión funcional y overhead de cold start e invocación. |

### Guardrails de tamaño

| Componente | Límite | Uso estimado |
|-----------|--------|-------------|
| Payload entre estados de Step Functions | 256 KiB | ~25 KB (10% del límite) |
| Item DynamoDB | 400 KB | ~30 KB (7% del límite) |

### Lo que falta

No existen métricas reales de latencia porque la arquitectura no fue desplegada. Cold starts, tiempos de respuesta de DynamoDB y concurrencia requieren medición en un ambiente real.

---

## Cost Optimization

### Lo que ya se resuelve bien

Todos los servicios de la arquitectura operan bajo modelo pay-per-use. No existen EC2, ECS, NAT Gateway, ALB ni ningún recurso con costo fijo permanente. DynamoDB usa PAY_PER_REQUEST (sin capacity planning). Lambda está configurada con 256 MB, conservadora para el workload. Express Workflow cobra por ejecución y duración, no por transición de estado.

| Servicio | Modelo de costo |
|----------|----------------|
| Lambda | Por invocación + duración |
| Step Functions Express | Por ejecución + duración |
| DynamoDB | Por request |
| CloudFront | Por request + transferencia |
| API Gateway | Por request |
| CloudWatch Logs | Por ingesta + almacenamiento |
| S3 | Storage + requests (mínimo para estáticos) |

La estimación monetaria detallada se presenta en [docs/05-costos.md](./05-costos.md).

### Qué mejoraría con más tiempo

Reducir la retención de logs si el volumen crece. Migrar a Lambda ARM64 (Graviton) para mejorar la relación precio/rendimiento. Evaluar Reserved Concurrency si el uso se estabiliza.

---

## Sustainability

### Lo que ya se resuelve bien

La arquitectura escala a cero: cuando no hay requests, Lambda, Step Functions y DynamoDB no consumen recursos. El frontend estático en S3/CloudFront no requiere compute permanente. Al operar en una sola región se evita la replicación innecesaria de datos y compute.

### Lo que falta

No existe medición de utilización real ni métricas del AWS Customer Carbon Footprint Tool. Tampoco una comparación cuantitativa con alternativas como EC2 o ECS.

### Qué mejoraría

Activar Customer Carbon Footprint Tool al desplegar. Monitorear duración de funciones para detectar ineficiencias. Revisar la retención de logs para evitar almacenamiento innecesario a largo plazo.

---

## Serverless Applications Lens

| Aspecto | Evaluación |
|---------|-----------|
| **Compute** | Funciones cortas, stateless y cohesionadas. Dominio compartido mediante Lambda Layer. |
| **Orquestación** | Step Functions como coordinador explícito. Las funciones no se invocan entre sí. |
| **Data** | DynamoDB con un solo access pattern (assessment_id como partition key). |
| **Edge / API** | CloudFront como entry point único. API Gateway delega al workflow. Frontend en S3. |
| **Observabilidad** | Logging definido para cada transición. Alarmas y dashboards pendientes. |

La arquitectura es consistente con las prácticas recomendadas por la Serverless Lens: orquestación explícita, funciones sin estado, datos diseñados para access patterns, y frontend completamente desacoplado del backend.

---

## Matriz de hallazgos

| ID | Pilar | Hallazgo | Estado | Riesgo |
|----|-------|----------|--------|--------|
| WA-OE-01 | Op. Excellence | Infraestructura completa como código | ✅ Definido | — |
| WA-OE-02 | Op. Excellence | Sin pipeline CI/CD ni automatización de deployment | 🟡 Gap | Medio |
| WA-OE-03 | Op. Excellence | Sin alarmas configuradas | 🟡 Gap | Medio |
| WA-SEC-01 | Security | IAM con mínimo privilegio | ✅ Definido | — |
| WA-SEC-02 | Security | Sin autenticación de usuarios en la API | 🟡 Gap | Alto si se expone / Bajo para MVP |
| WA-SEC-03 | Security | Sin WAF ni rate limiting | 🟡 Gap | Medio si se expone |
| WA-SEC-04 | Security | Cifrado at rest con claves AWS default | ✅ Suficiente | Bajo |
| WA-REL-01 | Reliability | Error paths y retries configurados en el workflow | ✅ Definido | — |
| WA-REL-02 | Reliability | Operación single-region | 🟡 Limitación | Medio |
| WA-REL-03 | Reliability | DynamoDB PITR habilitado | ✅ Definido | — |
| WA-PERF-01 | Performance | Arquitectura adecuada al workload | ✅ Alineado | — |
| WA-PERF-02 | Performance | Sin métricas reales de latencia | ⏳ Pendiente | Bajo |
| WA-COST-01 | Cost | Pay-per-use completo | ✅ Alineado | — |
| WA-SUS-01 | Sustainability | Sin recursos ociosos permanentes | ✅ Alineado | — |

---

## Fortalezas principales

1. El motor de dominio está desacoplado de la infraestructura y es testeable sin AWS.
2. Toda la infraestructura está definida como código y es reproducible.
3. El workflow documenta cada paso del análisis de forma explícita y configurable.
4. La orquestación vive en Step Functions, no dentro de las funciones Lambda.
5. Las funciones Lambda no tienen acceso directo a la persistencia.
6. Existe validación automatizada del dominio, contratos e infraestructura (159 tests).
7. Se demuestra equivalencia funcional entre el pipeline local y la cadena de Lambdas.

## Mejoras priorizadas

### Antes de producción
- Implementar autenticación de usuarios.
- Ejecutar `sam validate` y deployment en entorno de desarrollo.
- Realizar pruebas end-to-end en AWS.

### Hardening
- WAF con rate-based rules según nivel de exposición.
- Alarmas y dashboard operacional.
- KMS propia si regulación lo requiere.
- Security monitoring activo.

### Evolución
- Multi-región si se requiere alta disponibilidad.
- Pipeline CI/CD.
- Benchmarks de performance.
- Medición de huella de carbono.

---

## Riesgos más importantes

| # | Riesgo | Mitigación actual | Residual |
|---|--------|-------------------|----------|
| 1 | Arquitectura no desplegada — integraciones AWS no validadas | IaC + tests estáticos + equivalencia demostrada | Medio |
| 2 | API pública sin autenticación | Aceptable para MVP académico sin exposición real | Alto si se expone |
| 3 | Operación en una sola región | Servicios administrados reducen impacto parcial | Medio |
| 4 | Observabilidad limitada a logs sin alarmas | Logs definidos; alarmas como siguiente paso | Medio |
