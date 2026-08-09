# Karen Sofía González — RemediarJuntos

> Plataforma web solidaria desacoplada para la conexión y gestión de donaciones de medicamentos con geolocalización geoespacial.

---

## Resumen del proyecto

**RemediarJuntos** — Plataforma web para la recolección, trazabilidad y geolocalización de donaciones de medicamentos e insumos médicos urgentes entre donantes y fundaciones, dockerizada y con propuesta de infraestructura en AWS.

| | |
|---|---|
| **App** | Python 3.11 (FastAPI) + Nginx + PostgreSQL / PostGIS |
| **Docker** | `docker compose up --build` en `app/` |
| **DB** | PostgreSQL 15 + Extensión Espacial PostGIS (Relacional) |

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [01-descripcion.md](./docs/01-descripcion.md) | Qué es la app, público objetivo, geolocalización y justificación de PostgreSQL + PostGIS |
| [02-arquitectura-local.md](./docs/02-arquitectura-local.md) | Arquitectura de 3 contenedores con Docker Compose, puertos, volúmenes y ejecución |
| [03-arquitectura-aws.md](./docs/03-arquitectura-aws.md) | Propuesta de infraestructura serverless en AWS y justificación de cada servicio |
| [04-well-architected.md](./docs/04-well-architected.md) | Evaluación bajo los 6 pilares de AWS Well-Architected Framework |
| [05-costos.md](./docs/05-costos.md) | Estimación de costos mensuales en AWS y estrategias de optimización |
| [06-disaster-recovery.md](./docs/06-disaster-recovery.md) | Análisis de riesgos, RTO/RPO, backups y plan de contingencia (Pilot Light) |

## Estructura del repositorio

```text
├── app/
│   ├── backend/          # API REST (FastAPI + Python 3.11)
│   ├── frontend/         # Interfaz Web + Proxy Inverso Nginx
│   ├── docker-compose.yml # Orquestación local de los 3 contenedores
│   └── .env.example      # Variables de entorno de ejemplo
├── diagrams/
│   ├── arquitectura-local.png # Diagrama de contenedores Docker
│   └── arquitectura-aws.png   # Diagrama de infraestructura en AWS
├── docs/                 # Documentación técnica del proyecto (01 a 06)
└── README.md             # Archivo principal