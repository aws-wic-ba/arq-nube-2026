# 02 — Arquitectura Local

## Servicios

Actualmente la aplicación se ejecuta mediante **Docker Compose**, utilizando un contenedor que aloja la aplicación desarrollada con Flask.

| Contenedor | Imagen | Puerto | Función |
|------------|--------|:------:|---------|
| odontogest | Imagen personalizada (Flask) | 5000 | Ejecuta la aplicación web OdontoGest. |

> **Nota:** La arquitectura fue diseñada para incorporar PostgreSQL como servicio independiente en futuras versiones del proyecto.

---

## Diagrama local

```
Usuario (http://localhost:5000)
            │
            ▼
    ┌────────────────────┐
    │    Docker Compose  │
    │ Gestiona servicios │
    └─────────┬──────────┘
              │
              ▼
    ┌────────────────────┐
    │     OdontoGest     │
    │   Flask - Puerto   │
    │       5000         │
    └────────────────────┘
```

*(También esta disponible el diagrama realizado en Draw.io incluido en la carpeta `diagrams/`.)*

---

## Cómo levantar la aplicación

Desde la carpeta del proyecto ejecutar:

```bash
docker compose up --build
```

La aplicación quedará disponible en:

```
http://localhost:5000
```

---

## Detener la aplicación

```bash
docker compose down
```

---

## Consideraciones

- Docker Compose construye automáticamente la imagen de la aplicación.
- La aplicación queda disponible localmente a través del puerto **5000**.
- Esta arquitectura corresponde al **MVP** del proyecto y fue diseñada para evolucionar incorporando PostgreSQL y otros servicios en futuras versiones.