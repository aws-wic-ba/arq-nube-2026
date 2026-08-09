# Secure Design Advisor

Aplicación web que permite a arquitectos de soluciones evaluar la postura de seguridad de una arquitectura cloud de forma temprana, determinística y explicable.

## Qué problema resuelve

Security by Design, Zero Trust y Threat Modeling son principios ampliamente conocidos, pero en la práctica rara vez se traducen en decisiones tempranas, trazables y verificables durante el diseño de una solución. Esto provoca revisiones tardías, análisis inconsistentes y controles agregados sin trazabilidad.

Secure Design Advisor operacionaliza Security by Design transformando información de arquitectura en amenazas, riesgos, brechas y controles accionables mediante un motor de reglas determinístico.

## Qué hace

A partir de información sobre componentes, exposición, datos y controles existentes, la herramienta:

- Identifica amenazas mediante STRIDE, inferidas del diseño (no declaradas manualmente).
- Calcula riesgo con probabilidad, impacto y modificadores contextuales.
- Evalúa alineamiento preliminar con Zero Trust en cinco dimensiones.
- Genera requisitos de seguridad trazables con cadena completa: amenaza → riesgo → requisito → control → servicio AWS.
- Entrega un Security Architecture Gate con tres posibles resultados: Aprobado, Aprobado con Observaciones, o Requiere Revisión.

El resultado es determinístico. No utiliza inteligencia artificial.

## Arquitectura

El Threat Modeling Engine es framework-agnostic: no depende de Flask, Lambda ni infraestructura AWS. Esto permite ejecutarlo tanto en un entorno local con Docker como en una arquitectura serverless.

### Ejecución local

```
Docker → Flask (thin API adapter) → engine/ → JSON response
```

Un frontend estático (HTML/CSS/JS) se comunica con un endpoint `POST /api/assess` que invoca el pipeline completo del engine y retorna el resultado como JSON.

### Arquitectura AWS (definida en IaC, no desplegada)

```
CloudFront → S3 (frontend) + API Gateway → Step Functions Express → 4 Lambda adapters → DynamoDB
```

Las Lambda adapters reutilizan el mismo engine. Step Functions orquesta el workflow de análisis. La persistencia se maneja por integración directa con DynamoDB (las Lambdas no escriben a la base).

## Ejecución local

```bash
cd Entregables/gabriela-moya/app
docker compose up --build
```

Acceder a `http://localhost:5000/app/`.

Alternativamente, sin Docker:

```bash
cd Entregables/gabriela-moya/app
pip install -r requirements.txt
PYTHONPATH=src python src/local_api/app.py
```

## Pruebas

```bash
cd Entregables/gabriela-moya/app
pip install -r requirements.txt
python -m pytest
```

159 tests cubren: engine de dominio, Lambda handlers, equivalencia pipeline/Lambdas, esquema DynamoDB, endpoint API, infraestructura (validación estática de ASL y template SAM), y contratos de datos.

## Estructura del proyecto

```
app/
├── src/engine/             # Core Threat Modeling (framework-agnostic)
├── src/local_api/          # Flask thin adapter
├── data/                   # Catálogos de reglas (JSON)
├── frontend/               # Frontend estático (HTML/CSS/JS + Bootstrap)
├── lambdas/                # Lambda adapters (4 handlers)
├── infrastructure/         # IaC: SAM template, ASL, OpenAPI
├── tests/                  # Unit + contract + infrastructure tests
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [01-descripcion.md](docs/01-descripcion.md) | Descripción funcional, flujo, caso demostrativo |
| [02-arquitectura-local.md](docs/02-arquitectura-local.md) | Docker, Flask adapter, pipeline, engine |
| [03-arquitectura-aws.md](docs/03-arquitectura-aws.md) | Serverless workflow, Step Functions, Lambda, DynamoDB |
| [04-well-architected.md](docs/04-well-architected.md) | Evaluación con los seis pilares del Well-Architected Framework |
| [05-costos.md](docs/05-costos.md) | Estimación de costos por escenario con precios oficiales |
| [06-disaster-recovery.md](docs/06-disaster-recovery.md) | Estrategia Backup & Restore, RTO/RPO, runbook propuesto |

## Estado del proyecto

| Componente | Estado |
|-----------|--------|
| Threat Modeling Engine | Implementado y testeado |
| Frontend estático | Implementado |
| Lambda adapters | Implementados y testeados |
| Infraestructura AWS (IaC) | Definida, validación estática |
| Docker | Definido, validación manual pendiente |
| Deployment AWS | No requerido por el curso |

## Tecnologías

- Python 3.11, Flask, Gunicorn
- HTML, CSS, JavaScript vanilla, Bootstrap 5
- Docker
- AWS: CloudFront, S3, API Gateway, Step Functions, Lambda, DynamoDB, CloudWatch
- SAM (Serverless Application Model)
