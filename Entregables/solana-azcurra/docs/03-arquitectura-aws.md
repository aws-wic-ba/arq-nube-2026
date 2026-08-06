# 03 — Propuesta de infraestructura AWS

## Diagrama

Ver: `diagrams/arquitectura-aws-iconos.png` (con íconos oficiales de AWS) y `diagrams/arquitectura-aws.png` (esquema simplificado)

## Flujo de tráfico

```
Usuario (vecino / emprendedor / municipio)
  │
  ▼
Route 53 (DNS)
  │
  ▼
Application Load Balancer (HTTPS)
  │
  ▼
ECS Fargate (contenedor de la app)
  │
  ├──► RDS PostgreSQL (subnet privada)
  ├──► Secrets Manager (credenciales de la DB)
  └──► CloudWatch (logs y métricas)

ECR ──► ECS Fargate (registro de imágenes Docker)
```

## Servicios y justificación

| Servicio | Rol | Por qué |
|----------|-----|---------|
| **ECS Fargate** | Corre el contenedor de la app | Contenedores sin administrar servidores: uso la misma imagen Docker del entorno local y AWS se encarga de dónde corre. Escala agregando más tareas si sube el tráfico |
| **ALB** | Load balancer | Recibe el tráfico HTTPS y lo reparte entre los contenedores; hace health checks para no mandar tráfico a un contenedor caído |
| **RDS PostgreSQL** | Base de datos gestionada | Mismo motor que uso localmente. AWS se encarga de los backups automáticos y los parches. Va en una subnet privada: solo la app puede acceder, nunca internet |
| **ECR** | Registro de imágenes Docker | Es donde subo la imagen de la app para que ECS la despliegue. Privado y versionado |
| **Route 53** | DNS | Para tener un dominio propio (por ejemplo, ecocanje del municipio) apuntando al ALB |
| **ACM** | Certificados TLS | Certificado HTTPS gratis y con renovación automática para el ALB |
| **Secrets Manager** | Credenciales de la DB | La contraseña de la base nunca queda en el código ni en variables a mano |
| **CloudWatch** | Logs y métricas | Para ver los logs de la app y recibir alertas si algo falla |

## Decisiones que tomé

- **Evalué App Runner, elegí ECS Fargate por costos:** App Runner es más simple (incluye HTTPS, load balancing y auto scaling sin configurar nada), pero su hora de cómputo cuesta ~50-60% más que la de Fargate (~$0.064 vs ~$0.040 por vCPU/hora). Como la app va a correr 24/7 para varios municipios, con carga sostenida conviene Fargate aunque haya que sumar el costo fijo del ALB (~$18/mes). Con muy poco tráfico la cuenta se daría vuelta, pero ese no es mi caso de uso.
- **Una sola región:** los usuarios de cada municipio están todos en el mismo país, no necesito infraestructura global.
- **El mapa de comercios no usa ningún servicio extra:** se resuelve en el frontend con una librería de mapas gratuita (Leaflet + OpenStreetMap), así no sumo costos.
