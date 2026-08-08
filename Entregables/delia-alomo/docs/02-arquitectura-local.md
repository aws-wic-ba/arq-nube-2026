# 02 - Arquitectura local

## Descripción general

La aplicación ZeroToTech se ejecuta localmente utilizando Docker y Docker Compose. La solución está compuesta por un único servicio llamado zerototech, que construye la aplicación desarrollada en React y la sirve mediante un servidor Nginx.

El Dockerfile utiliza una estrategia multi-stage build:

En la primera etapa se utiliza una imagen de Node.js para instalar las dependencias y generar el build de producción con Vite.

En la segunda etapa se utiliza una imagen de Nginx, donde se copian los archivos generados y se sirven como una aplicación web estática.

Esta estrategia permite obtener una imagen final más liviana y optimizada para producción.

## Servicios

La arquitectura local está compuesta por un único servicio:

## Configuración

Nombre del contenedor: zerototech-app

Puerto interno: 80

Puerto expuesto: 8080

Política de reinicio: unless-stopped

La aplicación queda disponible en: http://localhost:8080

## Volúmenes

La aplicación no utiliza volúmenes Docker. Esto se debe a que el proyecto corresponde a un MVP, no posee una base de datos local y el progreso del usuario se almacena mediante LocalStorage del navegador.

## Configuración de Nginx

Nginx se utiliza para:

- Servir los archivos estáticos generados por React.
- Comprimir el contenido mediante Gzip para mejorar el rendimiento.
- Aplicar políticas de caché para los recursos estáticos.
- Incorporar encabezados básicos de seguridad.
- Permitir el funcionamiento correcto de las rutas de la aplicación mediante la configuración de SPA.

## Ejecución

Para construir y levantar la aplicación:

docker compose up --build

La aplicación queda disponible en http://localhost:8080. Para detenerla:

docker compose down

## Diagrama de arquitectura local

Usuario
  │
  ▼
http://localhost:8080
  │
  ▼
Docker Compose
  │
  ▼
┌──────────────────────────┐
│ Contenedor zerototech-app │
│                           │
│  Nginx                   │
│    │                     │
│    ▼                     │
│  React (build Vite)      │
└──────────────────────────┘

Ver imagen completa en diagrams/arquitectura-local.png

## Conclusión

La arquitectura local de ZeroToTech fue diseñada para ser simple, reproducible y fácil de ejecutar en cualquier entorno. El uso de Docker permite que cualquier persona pueda levantar la aplicación utilizando un único comando, sin necesidad de instalar Node.js o configurar dependencias manualmente, garantizando un entorno consistente para desarrollo y pruebas.
