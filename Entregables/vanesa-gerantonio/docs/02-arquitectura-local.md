# 02 — Arquitectura local

Docker Compose inicia dos contenedores en una red privada:

```text
Navegador → http://localhost:8000 → web (Python + Flask + Gunicorn)
                                      ├─ SQL/5432 → db (PostgreSQL 16)
                                      └─ genera archivos Word en memoria
                                            ↓
                                      descarga del usuario
```

El volumen `postgres_data` conserva unidades, misiones, funciones e historial cuando se reemplazan los contenedores. El contenedor web espera el healthcheck de PostgreSQL. Para iniciar: entrar a `app/`, ejecutar `docker compose up --build` y abrir `http://localhost:8000`.
