# Datos iniciales de PeluApp

PeluApp carga automáticamente servicios y profesionales al iniciar el servidor.

Servicios:
- Corte
- Corte + brushing
- Coloración
- Peinado

Profesionales:
- Sofía — Coloración
- Martín — Cortes
- Valentina — Peinados

## Arranque

Desde esta carpeta:

```bash
docker compose up --build
```

Abrí:

http://localhost:3000

## Si ya habías ejecutado una versión anterior

La base MySQL usa un volumen persistente. Por eso, los scripts de `/db` de MySQL pueden no ejecutarse otra vez.

En ese caso, desde `app/` ejecutá:

```bash
docker compose down -v
docker compose up --build
```

El `-v` elimina el volumen local de MySQL y permite inicializar la base desde cero.

La aplicación también ejecuta una carga idempotente de servicios y profesionales al iniciar, por lo que no es necesario insertar los datos manualmente.
