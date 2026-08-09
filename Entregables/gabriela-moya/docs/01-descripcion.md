# 01 — Descripción de la aplicación

## ¿Qué hace la app?

**Secure Design Advisor** es una herramienta web que permite a arquitectos de soluciones evaluar la postura de seguridad de una arquitectura cloud de forma temprana, automatizada y explicable.

A partir de información sobre componentes, exposición, datos y controles existentes, la herramienta:

- Identifica **amenazas** mediante STRIDE (inferidas del diseño, no declaradas manualmente).
- Calcula **riesgo** con probabilidad, impacto y modificadores contextuales.
- Evalúa **alineamiento preliminar con Zero Trust** en 5 dimensiones.
- Genera **requisitos de seguridad** trazables.
- Recomienda **controles y servicios AWS** explicando por qué aplican.
- Entrega un **Security Architecture Gate**: Aprobado / Con Observaciones / Requiere Revisión.

El resultado es determinístico. No utiliza inteligencia artificial.

## ¿Por qué esta solución?

El caso fue seleccionado porque permite aplicar conceptos de arquitectura cloud, seguridad desde el diseño y serverless sobre un problema concreto y relevante para la industria.

Security by Design, Zero Trust y Threat Modeling son principios ampliamente conocidos, pero en la práctica no se traducen en decisiones tempranas y trazables durante el diseño. Esto provoca:

- Revisiones de seguridad tardías.
- Análisis manuales poco consistentes.
- Falta de trazabilidad entre amenaza, riesgo y control.
- Dificultad para incorporar seguridad desde etapas tempranas.

Secure Design Advisor **operacionaliza Security by Design** transformando información de arquitectura en resultados accionables mediante un serverless workflow determinístico:

```
Architecture input → Threat Modeling → Risk → Zero Trust → Controls → Gate decision
```

## ¿A quién está dirigida?

- **Usuario principal:** Arquitecto de Soluciones que diseña o evalúa arquitecturas cloud.
- **Usuario conceptual secundario:** Arquitecto de Seguridad que valida decisiones.

El MVP no implementa autenticación ni múltiples tipos de usuario.

## Flujo funcional

```
Contexto → Componentes → Propiedades → Revisión → Análisis → Resultado
```

El wizard guía al arquitecto paso a paso sin requerir experiencia previa en seguridad.

## ¿Qué analiza?

| Entrada | Descripción |
|---------|-------------|
| Contexto | Nombre, tipo de solución, criticidad, exposición a Internet, datos sensibles |
| Componentes | Frontend, API, Database, Files/Storage, Queue/Messaging, External System |
| Propiedades | Controles declarados por componente (autenticación, cifrado, rate limiting, etc.) |
| Controles generales | Logs, trazabilidad, mínimo privilegio, RTO/RPO |

| Salida | Descripción |
|--------|-------------|
| Amenazas STRIDE | Inferidas del diseño mediante 15 reglas determinísticas |
| Riesgo | Likelihood × Impact con modificadores contextuales (score 1–25) |
| Zero Trust | Alineamiento preliminar en 5 dimensiones (cumple / parcial / brecha) |
| Recomendaciones | Requisito → Control → Servicio AWS → Explicación |
| Security Gate | APROBADO / APROBADO CON OBSERVACIONES / REQUIERE REVISIÓN |

## Arquitectura

El engine de Threat Modeling es **framework-agnostic**: no depende de Flask, Lambda ni infraestructura AWS. Esto permite reutilizarlo tanto en ejecución local como en la arquitectura cloud.

### Ejecución local

```
Docker
 └── Flask (thin local API adapter)
      ├── GET /app/       → Frontend estático (HTML/CSS/JS)
      └── POST /api/assess → pipeline.py → engine/ → JSON
```

Stack: Python 3.11, Flask, HTML/CSS/JavaScript vanilla, Bootstrap 5, Docker.
Sin base de datos local. Stateless.

### Arquitectura AWS target (definida en IaC, no desplegada)

```
CloudFront
 ├── /* → S3 (frontend estático)
 └── /api/* → API Gateway
                  └── Step Functions Synchronous Express
                       ├── Validate (Lambda adapter)
                       ├── PersistProcessing (DynamoDB direct integration)
                       ├── ThreatAnalysis (Lambda adapter)
                       ├── RiskEvaluation (Lambda adapter)
                       ├── BuildResult (Lambda adapter)
                       ├── PersistCompleted (DynamoDB direct integration)
                       └── Success
```

Las Lambda adapters reutilizan el mismo engine que la ejecución local. No duplican lógica de negocio. Step Functions orquesta el workflow.

Definida completamente en IaC (SAM/CloudFormation). No desplegada en AWS para este TP.

## Decisión sobre base de datos

La arquitectura local no utiliza base de datos. Para la arquitectura AWS se diseñó DynamoDB:

- Acceso por `assessment_id` (partition key).
- Modelo PAY_PER_REQUEST.
- Point-in-Time Recovery habilitado.
- Integración directa con Step Functions (sin Lambdas CRUD adicionales).

Detalle completo en [03-arquitectura-aws.md](./03-arquitectura-aws.md).

## Estado de implementación

| Componente | Estado |
|-----------|--------|
| Threat Modeling Engine completo | ✅ Implementado y testeado |
| Frontend estático (wizard + resultado) | ✅ Implementado |
| Lambda adapters (4 handlers) | ✅ Implementados y testeados |
| Contratos canónicos (input/output JSON) | ✅ Definidos y validados |
| Modelo de persistencia DynamoDB | ✅ Diseñado y testeado (schema) |
| Infraestructura AWS (SAM + ASL + OpenAPI) | ✅ Definida en IaC, validación estática |
| Tests automatizados | ✅ 159 passing |
| Docker | ⏳ Validación manual pendiente |
| Browser E2E | ⏳ Validación manual pendiente |
| sam build / sam validate | ⏳ Requiere SAM CLI |
| Deployment AWS | ❌ No requerido por el curso |

## Caso demostrativo: API Proveedores

Evaluación de una API pública de alta criticidad con Frontend, API, Database y External System.

| Métrica | Valor |
|---------|-------|
| Amenazas detectadas | 4 |
| Riesgo general | Crítico |
| Security Gate | REQUIERE REVISIÓN DE ARQUITECTURA DE SEGURIDAD |
| Zero Trust | 60% (Identity ✓, Access ✗, Data Protection ✗, Segmentation ✓, Visibility ✓) |

**Findings:**
1. API sin autorización granular → Elevation of Privilege (score 20, Critical)
2. API pública sin rate limiting → Denial of Service (score 20, Critical)
3. Base de datos sensible sin cifrado en reposo → Information Disclosure (score 15, High)
4. Secretos sin gestión centralizada → Information Disclosure (score 15, High)

Resultados generados automáticamente por el motor de reglas.

## Evoluciones futuras

- Historial de evaluaciones y reevaluaciones.
- Autenticación con Amazon Cognito.
- AWS WAF frente a API Gateway.
- Exportación de reportes a S3.
- Map State para paralelismo a escala.
- Integración con AWS Well-Architected Tool API.
