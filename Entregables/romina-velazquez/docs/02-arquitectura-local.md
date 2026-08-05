## 02 — Arquitectura local

La arquitectura local de la aplicación consiste en lo siguiente:

App: Corre con FastAPI / Uvicorn (Python) utilizando el archivo main.py.  

Base de datos (db): Utiliza SQLite a través de SQLModel, almacenándose en el archivo database.db.  

## Diagrama local

```
Browser (localhost:8000)
        │
        ▼
  ┌─────────────┐
  │   app       │  FastAPI / Jinja2 / Tailwind
  │  :8000      │
  └──────┬──────┘
         │ SQLModel / Session[cite: 1]
         ▼
  ┌─────────────┐
  │    db       │  SQLite Database (database.db)[cite: 1]
  └─────────────┘

```

## Cómo levantar la app

```bash
cd app/
docker compose up --build
```

La app queda disponible en `http://0.0.0.0:8000/`.

Para detenerla:

```bash
docker compose down
```

