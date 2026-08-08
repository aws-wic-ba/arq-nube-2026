# Laura Perez Bosio — ShibaShop

TP Final — Arquitectura de Computación en la Nube 2026 · AWS Women in Cloud Buenos Aires

## Resumen

**ShibaShop** es un e-commerce con carrito de compras, dockerizado, con una propuesta de infraestructura en AWS.

La idea viene de haber vendido durante mucho tiempo en MercadoLibre: una tienda propia me permitiría manejar yo el método de entrega y quedarme con la relación con el cliente, a cambio de hacerme cargo de que la tienda no se caiga.

| | |
|---|---|
| Stack | Node.js + Express + EJS |
| Base de datos | PostgreSQL 16 (relacional) |
| Páginas | Catálogo y carrito con recomendaciones |
| AWS | EC2 con Auto Scaling, RDS Multi-AZ, ALB, CloudFront, S3 |

## Cómo levantarla

```bash
cd app
docker compose up --build
```

Abrir http://localhost:3000. El endpoint `/health` verifica que la app y la base estén conectadas.

## Pruebas

**Concurrencia en el checkout.** El descuento de stock corre dentro de una transacción con `SELECT ... FOR UPDATE`. Para comprobar que no se vende stock inexistente cuando varias personas compran la última unidad al mismo tiempo:

```bash
docker exec shibashop-db psql -U shibashop -d shibashopdb -c "UPDATE productos SET stock = 1 WHERE id = 4;"
node app/test/concurrencia.js
```

Resultado esperado: 1 compra confirmada, 24 rechazadas y stock final en 0.

**Persistencia del carrito.** El carrito vive en la base y no en la memoria del servidor, así que sobrevive a que se caiga la instancia que lo atendió:

```bash
node app/test/carrito-persistente.js
```

El script arma un carrito, reinicia el contenedor de la app y verifica que el carrito siga completo. Las salidas están en [evidence/](./evidence/).

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [01-descripcion.md](./docs/01-descripcion.md) | Qué es la app, por qué la elegí, usuarios y base de datos |
| [02-arquitectura-local.md](./docs/02-arquitectura-local.md) | Cómo corre localmente con Docker |
| [03-arquitectura-aws.md](./docs/03-arquitectura-aws.md) | Servicios AWS propuestos y justificación |
| [04-well-architected.md](./docs/04-well-architected.md) | Los seis pilares y cómo los abordo |
| [05-costos.md](./docs/05-costos.md) | Estimación, conversión a pesos y punto de equilibrio |
| [06-disaster-recovery.md](./docs/06-disaster-recovery.md) | Usuarios, riesgos, RTO/RPO y plan de recuperación |

## Diagramas

| Archivo | Contenido |
|---------|-----------|
| [arquitectura-local.png](./diagrams/arquitectura-local.png) | Contenedores y red local |
| [arquitectura-aws.png](./diagrams/arquitectura-aws.png) | Infraestructura propuesta en AWS |

## Evidencias

| Archivo | Contenido |
|---------|-----------|
| [app-running.png](./evidence/app-running.png) | El catálogo corriendo con `docker compose up` |
| [app-carrito.png](./evidence/app-carrito.png) | El carrito con las recomendaciones |
| [test-concurrencia.txt](./evidence/test-concurrencia.txt) | Salida del test de 25 compras simultáneas |
| [test-carrito-persistente.txt](./evidence/test-carrito-persistente.txt) | El carrito sobrevive al reinicio del contenedor |
| [linkedin-post.png](./evidence/linkedin-post.png) | El post publicado en LinkedIn |
