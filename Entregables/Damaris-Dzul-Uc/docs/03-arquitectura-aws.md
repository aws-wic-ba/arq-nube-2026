# Propuesta de arquitectura en AWS

## Servicios propuestos

| Servicio | Uso | Por qué |
|----------|-----|---------|
| **Route 53** | DNS del dominio del ayuntamiento (ej. `becas.hunucma.gob.mx`) | Punto de entrada público, permite failover de DNS si algún día hay multi-región |
| **CloudFront** | CDN delante de la app | El público de Hunucmá, Yucatán, México se conecta con conexiones móviles no siempre óptimas; CloudFront cachea estáticos (CSS) y termina TLS cerca del usuario, bajando latencia sin tocar el backend |
| **Application Load Balancer (ALB)** | Balanceo hacia los contenedores de la app | Necesario en cuanto corro más de una tarea de `web`; también hace terminación TLS interna y health checks |
| **ECS Fargate** | Corre el contenedor `web` (Node/Express) | Elegí Fargate en vez de EC2 porque no quiero administrar servidores para una app de tráfico bajo y estacional (picos sólo cuando abre la convocatoria de becas). Fargate escala tareas sin que gestione parches de SO ni AMIs |
| **RDS PostgreSQL (Multi-AZ)** | Reemplaza el contenedor `db` local | Mismo motor que uso local (Postgres), así que no cambio el modelo de datos. RDS Multi-AZ da failover automático de la base, que es el dato más crítico del sistema (identidad de solicitantes) |
| **S3** | Reemplaza el volumen `uploads_data` para guardar INE, actas, comprobantes | Los documentos son archivos binarios (PDF/imagen), no filas de base de datos — S3 es más barato y duradero (11 nueves) que guardarlos en disco de un contenedor efímero. Con versionado + cifrado (SSE-S3 o SSE-KMS) porque son documentos de identidad |
| **IAM (roles de tarea + políticas)** | Permisos de ECS hacia S3 y RDS (via Secrets Manager) | Principio de mínimo privilegio: la tarea `web` sólo puede leer/escribir en el bucket y prefijo que le corresponde, nada más |
| **Secrets Manager** | Credenciales de RDS y `SESSION_SECRET` (firma de cookies de sesión) | Evita hardcodear el usuario/password de la base y el secreto de sesión en variables de entorno del contenedor, como hago ahora en local con `docker-compose.yml` |
| **CloudWatch (Logs + Alarms)** | Logs de la app y métricas de ECS/RDS | Necesito saber si el sistema cae justo cuando abre la convocatoria y hay pico de solicitantes |
| **WAF (en el ALB o CloudFront)** | Protección básica contra bots/ataques comunes | El formulario es público en internet y recibe datos personales sensibles (CURP, identificación oficial) |

## Diagrama

El diagrama va en `diagrams/arquitectura-aws.png` (hecho en draw.io con AWS Architecture Icons). Flujo:

```
Usuario → Route 53 → CloudFront → ALB → ECS Fargate (web) → RDS Postgres (Multi-AZ)
                                                 │
                                                 └────► S3 (documentos, cifrado)
                                                 └────► Secrets Manager (credenciales DB)
```

## Qué no llevo a producción tal cual

No es necesario desplegar nada real en AWS para este TP — esto es diseño y justificación. Si lo hiciera, empezaría con **una sola tarea Fargate + RDS single-AZ** (ver `05-costos.md`) y subiría a Multi-AZ/autoscaling recién si el volumen de solicitantes lo justifica.
