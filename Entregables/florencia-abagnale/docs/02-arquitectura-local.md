# 02 — Arquitectura local

## Servicios

La app corre con un único contenedor Docker (no requiere base de datos
local: el estado de la corrida se mantiene en memoria durante la demo,
ya que cada ejecución es independiente y por lotes).

| Contenedor | Imagen         | Puerto |
|------------|----------------|--------|
| web        | Python 3.12 / Flask | 5000 |

## Diagrama local

Browser (localhost:5000)
│
▼
┌──────────────────┐
│ web │ Flask (Python)
│ :5000 │
│ │
│ engine.py │ clasificación de roles +
│ (filtrado + │ reporte de compliance
│ reporte) │ (ISO 27001 / PCI-DSS)
└──────────────────┘


Un único proceso Flask sirve las 2 páginas (`/` para cargar el JSON,
`/resultados` para ver la clasificación) e importa la lógica de
`engine.py`, que es el mismo motor de filtrado que se usa en la
propuesta de arquitectura AWS (docs/03), solo que ahí corre como
función Lambda en vez de servidor Flask.

## Cómo levantar la app

```bash
cd app/
docker compose up --build
```

La app queda disponible en `http://localhost:5000`.

Para detenerla:

```bash
docker compose down
```

## Flujo de uso

1. En `http://localhost:5000` se pega o edita el JSON de entrada
   (viene precargado con un dataset de ejemplo de 6 identidades).
2. Al hacer click en "Procesar identidades", el motor clasifica cada
   rol según mínimo privilegio (inactividad + MFA) y redirige a
   `/resultados`.
3. `/resultados` muestra: cuántos roles quedaron listos para migrar,
   cuántos fueron escalados a revisión manual (con el motivo puntual
   de cada uno), el ticket que se generaría en Jira, y los controles
   de ISO 27001 / PCI-DSS aplicados en esa corrida.
