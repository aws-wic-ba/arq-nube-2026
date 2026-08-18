# 02 — Arquitectura local

## Servicios

Este proyecto sigue una arquitectura **serverless-first**: no se usa
EC2 ni contenedores para el backend, por lo que **no requiere Docker**.
El único componente que corre "localmente" es el frontend, que además
consume la API real ya desplegada en AWS.

| Componente | Tecnología | Cómo corre |
|---|---|---|
| Frontend | HTML / CSS / JavaScript (`fetch`) | Servido con Live Server (VS Code) en `http://127.0.0.1:5500` |
| Backend | AWS Lambda (Python) | Ya desplegado en AWS, no corre localmente |
| Base de datos | Amazon DynamoDB | Ya desplegada en AWS, no corre localmente |

## Diagrama local

```
Browser (127.0.0.1:5500)
        │
        ▼
  ┌─────────────────┐
  │  frontend/       │  HTML + JS (fetch)
  │  index.html      │
  └────────┬─────────┘
           │ HTTPS POST /donantes
           ▼
  ┌─────────────────────────┐
  │  Amazon API Gateway      │  (ya en AWS)
  └────────┬─────────────────┘
           ▼
  ┌─────────────────────────┐
  │  AWS Lambda               │  (ya en AWS)
  │  logica-donacion          │
  └────────┬─────────────────┘
           ▼
  ┌─────────────────────────┐
  │  Amazon DynamoDB          │  (ya en AWS)
  │  Donantes / Donaciones    │
  └───────────────────────────┘
```

## Cómo levantar el frontend

1. Clonar este repositorio.
2. Abrir la carpeta `app/frontend/` con [Visual Studio Code](https://code.visualstudio.com/).
3. Instalar la extensión **Live Server** (autor: Ritwick Dey).
4. Clic derecho sobre `index.html` → **"Open with Live Server"**.
5. Se abre en `http://127.0.0.1:5500/index.html`, ya conectado a la API real.

> **Nota:** abrir `index.html` directamente como archivo (doble clic,
> `file:///...`) **no funciona**, porque el navegador bloquea las
> peticiones por política de CORS al no reconocer un origen HTTP válido.
> Debe servirse desde un servidor HTTP local (Live Server) o, en
> producción, desde Amazon S3 + CloudFront.

## Backend (referencia, ya desplegado en AWS)

El código de la función Lambda se incluye en `app/backend/lambda_function.py`
como referencia — no requiere ejecución local, ya que corre de forma
administrada en AWS Lambda.
