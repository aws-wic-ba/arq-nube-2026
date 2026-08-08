# 02 — Arquitectura local

La aplicación corre con Docker Compose en dos contenedores. No hace falta instalar Node ni PostgreSQL en la máquina: alcanza con Docker.

| Servicio | Imagen | Puerto | ¿Expuesto al host? |
|----------|--------|--------|--------------------|
| `app` | Construida desde el `Dockerfile` (base `node:20-alpine`) | 3000 | Sí, en `localhost:3000` |
| `db` | `postgres:16-alpine` | 5432 | No |

**app.** Servidor Node.js con Express que arma las vistas con EJS. Expone el catálogo, el carrito y un endpoint `/health`. En el `Dockerfile` copio primero el `package.json` e instalo las dependencias, y recién después copio el código. Así, mientras las dependencias no cambien, Docker reutiliza esa capa de la caché y el build es más rápido. El contenedor corre con el usuario `node` y no como root.

**db.** PostgreSQL 16. No publica ningún puerto al host, así que solo se lo alcanza desde la red interna de Docker. La única forma de llegar a la base es a través del contenedor de la app. Es la misma idea que después se traduce en AWS a poner la base en una subred privada.

## Diagrama

```
              Navegador
                  │  http://localhost:3000
                  ▼
    ┌─────────────────────────────────────────┐
    │ Docker host                             │
    │  ┌───────────────────────────────┐      │
    │  │ red bridge: shibashop-net     │      │
    │  │  ┌──────────┐   ┌──────────┐  │      │
    │  │  │   app    │──▶│    db    │  │      │
    │  │  │ Node 20  │   │ Postgres │  │      │
    │  │  │  :3000   │   │  :5432   │  │      │
    │  │  └──────────┘   └────┬─────┘  │      │
    │  └──────────────────────┼────────┘      │
    │                         ▼               │
    │                  ┌─────────────┐        │
    │                  │ vol datos-db│        │
    │                  └─────────────┘        │
    └─────────────────────────────────────────┘
```

La versión en imagen está en [`diagrams/arquitectura-local.png`](../diagrams/arquitectura-local.png).

## Red y volúmenes

Los dos contenedores comparten la red bridge `shibashop-net`. Docker resuelve los nombres de servicio por DNS interno, así que la app se conecta con `DB_HOST=db` y no necesito ninguna IP.

| Volumen | Dónde se monta | Para qué |
|---------|----------------|----------|
| `datos-db` | `/var/lib/postgresql/data` | Guarda los datos. Sin esto, cada `docker compose down` borraría productos y pedidos. |
| `./db/init.sql` | `/docker-entrypoint-initdb.d/init.sql` | Crea las tablas y carga los productos de ejemplo. Se ejecuta solo la primera vez, cuando el volumen está vacío. |

## Orden de arranque

La app arranca más rápido que Postgres y, si intenta conectarse antes de tiempo, se cae. Lo resuelvo de dos formas.

Primero, con `depends_on` y `condition: service_healthy`: Compose espera a que el healthcheck de la base (`pg_isready`) dé bien antes de arrancar la app. Segundo, con reintentos en la propia aplicación (`src/db.js`), hasta 10 veces cada 2 segundos. Lo segundo es una red de seguridad, porque `depends_on` garantiza el orden pero no que la base ya esté aceptando consultas en ese instante exacto.

## Variables de entorno

Las credenciales no están escritas en el código. Se pasan por variables de entorno: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `COOKIE_SECRET` y `PORT`. El repositorio incluye un `.env.example` con la lista y valores por defecto para desarrollo. El `.env` real está en el `.gitignore` y no se sube.

## Cómo levantarla

```bash
cd app
docker compose up --build
```

Después abrir http://localhost:3000. Para verificar que la app y la base están conectadas, `/health` devuelve `{"status":"ok"}`.

Para frenarla: `docker compose down` conserva los datos, y `docker compose down -v` borra también el volumen.

## Flujo funcional

1. **Catálogo** (`/`): muestra los productos leídos de PostgreSQL, con precio y stock.
2. **Carrito** (`/carrito`): muestra subtotales y total, permite eliminar ítems y recomienda productos. Las recomendaciones salen de cruzar la tabla `pedido_items` contra sí misma: busca qué otros productos aparecían en los pedidos que incluían lo que hay en el carrito. No hace falta ningún servicio externo. El `init.sql` carga algunos pedidos históricos para que la función tenga datos desde el primer arranque.
3. **Confirmar compra**: inserta el pedido y descuenta el stock dentro de una transacción, usando `SELECT ... FOR UPDATE` para bloquear las filas involucradas. Si dos personas compran la última unidad al mismo tiempo, una sola se la lleva.

**El carrito se guarda en la base**, en las tablas `carritos` y `carrito_items`, y no en la memoria del servidor. El navegador solo conserva un token en una cookie firmada. Así la aplicación queda sin estado: cualquier instancia puede atender cualquier pedido, y el carrito sobrevive tanto a que se reinicie el servidor como a que la persona cierre el navegador y vuelva más tarde. El razonamiento de esta decisión está en [03-arquitectura-aws.md](./03-arquitectura-aws.md).

Hay dos pruebas automatizadas que verifican lo anterior:

| Script | Qué comprueba | Evidencia |
|--------|---------------|-----------|
| `app/test/concurrencia.js` | Lanza 25 compradores simultáneos sobre una única unidad de stock y verifica que solo uno la consiga | [test-concurrencia.txt](../evidence/test-concurrencia.txt) |
| `app/test/carrito-persistente.js` | Arma un carrito, reinicia el contenedor de la app y comprueba que el carrito siga completo | [test-carrito-persistente.txt](../evidence/test-carrito-persistente.txt) |
