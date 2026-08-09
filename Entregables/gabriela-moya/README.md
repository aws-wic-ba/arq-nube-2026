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

### Arquitectura AWS (desplegada)

```
CloudFront → S3 (frontend) + API Gateway → Step Functions Express → 4 Lambda adapters → DynamoDB
```

Las Lambda adapters reutilizan el mismo engine. Step Functions orquesta el workflow de análisis. La persistencia se maneja por integración directa con DynamoDB (las Lambdas no escriben a la base).

**Entorno desplegado (dev):**

| Recurso | URL / Identificador |
|---------|---------------------|
| Frontend | https://dvotsq485mjh9.cloudfront.net |
| API | https://qhunubdni4.execute-api.us-east-1.amazonaws.com/dev/api/assess |
| State Machine | sda-assessment-workflow-dev |
| DynamoDB | sda-assessments-dev |
| Stack CloudFormation | sda-dev (us-east-1) |

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
├── infrastructure/         # IaC: SAM template, ASL, OpenAPI, samconfig
│   ├── template.yaml       # SAM template (CloudFormation)
│   ├── samconfig.toml      # Configuración de despliegue
│   ├── test-payload.json   # Payload de verificación E2E
│   ├── step-functions/     # ASL workflow definition
│   └── api/                # OpenAPI spec (referencia)
├── tests/                  # Unit + contract + infrastructure tests
├── deploy.sh              # Script de despliegue automatizado
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

## Deployment AWS

Para desplegar la aplicación en AWS (cuenta 359932033910, us-east-1):

```bash
cd Entregables/gabriela-moya/app

# Deployment completo (prerequisites → layer → build → deploy → frontend → verify)
./deploy.sh

# Solo validar y construir (sin desplegar)
./deploy.sh --skip-deploy

# Solo verificar un despliegue existente
./deploy.sh --verify-only

# Usar contenedor Docker para el build de SAM
./deploy.sh --use-container
```

Requisitos previos:
- AWS CLI v2 configurado con credenciales para la cuenta 359932033910
- SAM CLI v1.x
- Python 3.11 o 3.12
- Región configurada: `aws configure set region us-east-1`

El script ejecuta 6 fases: prerequisites, layer preparation, SAM validate & build, SAM deploy, frontend upload + CloudFront invalidation, y verification end-to-end.

## Estado del proyecto

| Componente | Estado |
|-----------|--------|
| Threat Modeling Engine | ✅ Implementado y testeado |
| Frontend estático | ✅ Implementado |
| Lambda adapters | ✅ Implementados y testeados |
| Infraestructura AWS (IaC) | ✅ Definida y desplegada |
| Docker | ✅ Definido |
| Deployment AWS | ✅ Desplegado en us-east-1 (stack sda-dev) |
| Verificación end-to-end | ✅ API respondiendo correctamente |

## Tecnologías

- Python 3.11, Flask, Gunicorn
- HTML, CSS, JavaScript vanilla, Bootstrap 5
- Docker
- AWS: CloudFront, S3, API Gateway, Step Functions, Lambda, DynamoDB, CloudWatch
- SAM (Serverless Application Model)

## LinkedIn

[Post sobre el proyecto](https://www.linkedin.com/posts/gmoyamor_securityabrbyabrdesignabrforabrcloudabrarchitects-ugcPost-7492028457498116096-GzBl/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD_kzIMBBm7ShcVi-AKa6gkJ0rT1uB1Lu84)
