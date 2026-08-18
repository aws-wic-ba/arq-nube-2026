# MamaBank — "¿Y ahora qué te falta?"

**MamaBank** — App web para gestión de gastos de adolescentes con
aprobación de sus padres, dockerizada, con propuesta de infraestructura
en AWS.

## La idea

Esto nació de mi día a día con mi hija: la necesidad de compra que tiene
todo el tiempo, y lo poco que yo controlaba realmente sus decisiones antes
de que la plata ya estuviera gastada. Siempre terminaba enterándome
después, o dando el visto bueno medio a las apuradas por WhatsApp sin
pensarlo mucho.

MamaBank es eso, pero ordenado: mi hija (o hijo) carga lo que quiere
comprar, cuánto sale y para qué es — con foto si quiere — y yo lo veo,
lo pienso, y decido: apruebo todo, apruebo una parte, o rechazo y le
sugiero otra cosa. Recién ahí se le acredita el saldo. Nada de plata real
circulando, es solo una forma de ordenar el "¿puedo comprar esto?" antes
de que pase.

De paso, tengo un panel donde veo cuánto me está pidiendo cada uno por
mes y en qué se les va la plata — algo que antes no tenía forma de ver de
un vistazo.

| | |
|---|---|
| **App** | Python (Flask) + PostgreSQL |
| **Docker** | `docker compose up` en `app/` |
| **DB** | PostgreSQL (relacional) |

## Documentación

| Archivo | Contenido |
|---|---|
| [01-descripcion.md](../docs/01-descripcion.md) | Qué es la app, usuarios y justificación de la DB |
| [02-arquitectura-local.md](../docs/02-arquitectura-local.md) | Cómo corre localmente con Docker |
| [03-arquitectura-aws.md](../docs/03-arquitectura-aws.md) | Servicios AWS propuestos y justificación |
| [04-well-architected.md](../docs/04-well-architected.md) | Pilares que aplica y cómo |
| [05-costos.md](../docs/05-costos.md) | Estimación de costos y decisiones |
| [06-disaster-recovery.md](../docs/06-disaster-recovery.md) | Usuarios, riesgos, RTO/RPO y plan de DR |

## Cómo correrla localmente

### 1. Instalar Docker Desktop (si no lo tenés)

1. Descargá Docker Desktop desde [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) (elegí la versión para tu sistema operativo — Windows, Mac o Linux).
2. Instalalo dejando las opciones por defecto. En Windows puede pedirte reiniciar y activar WSL2 — dejalo que lo haga solo.
3. Abrí Docker Desktop y esperá a que abajo a la izquierda diga **"Engine running"**.
4. (Si es la primera vez, te va a pedir crear una cuenta gratuita de Docker Hub para poder usarlo.)

### 2. Levantar la app

1. Abrí esta carpeta (`app/`) en VS Code.
2. Abrí una terminal (Terminal → Nueva terminal).
3. Corré:

```bash
   docker compose up --build
```

4. La primera vez tarda unos minutos. Cuando se calme y veas algo como
   `Running on http://0.0.0.0:5000`, ya está lista.
5. En otra terminal, cargá los usuarios de ejemplo (solo la primera vez):

```bash
   docker compose exec web flask seed
```

6. Abrí el navegador en **http://localhost:5000**

## Usuarios de ejemplo (clave: `1234`)

| Email              | Rol         |
|--------------------|-------------|
| mariel@demo.com    | Madre       |
| sofia@demo.com     | Adolescente |
| leandro@demo.com   | Adolescente |

## Servicios (contenedores)

- **web**: app Flask (Python), puerto 5000.
- **db**: PostgreSQL 16, puerto 5432, con volumen persistente `db_data`.
para que los datos no se pierdan al reiniciar.
