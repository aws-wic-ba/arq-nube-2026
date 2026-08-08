StockFlow — App de Inventario

Resumen del proyectoStockFlow — 

App web/móvil para gestión de inventario y punto de venta (POS), basada en una arquitectura Serverless, dockerizada para desarrollo local, con propuesta de infraestructura nativa en AWS.


| |  | 
| :--- | :---: | 
| App | Node.js (AWS Lambda) + HTML/Tailwind CSS | 
| Docker | docker compose up --build en app/ (con LocalStack) | 
| Db | Amazon DynamoDB (NoSQL) |

DOCUMENTACION:

 



[01-description.md](./docs/01-description.md)

Qué es la app, módulos principales y justificación del modelo NoSQL

[02-arquitectura-local.md](./docs/02-arquitectura-local.md)

Cómo corre localmente con Docker y LocalStack

[03-arquitectura-aws.md](./docs/03-arquitectura-aws.md)

Servicios AWS propuestos (Serverless) y justificación

[04-well-architected.md](./docs/04-well-architected.md)

Pilares que aplica (AWS Well-Architected) y cómo

[05-costos.md](./docs/05-costos.md)

Estimación de costos y decisiones de optimización

[06-disaster-recovery.md](./docs/06-disaster-recovery.md)

Estrategia de backup, RTO/RPO y plan de DR