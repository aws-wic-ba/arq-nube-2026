# Arquitectura Local

## Descripción

La aplicación SecureReport se ejecuta localmente utilizando Docker Compose.

La arquitectura está compuesta por un único contenedor Docker que ejecuta una aplicación Flask desarrollada en Python.

El usuario accede a la aplicación desde un navegador web mediante la dirección:

http://localhost:5000

Docker expone el puerto 5000 del contenedor hacia el puerto 5000 del equipo local, permitiendo el acceso a la aplicación.

## Componentes

- Usuario
- Navegador Web
- Docker Engine
- Contenedor Docker
- Aplicación Flask (Python)

## Flujo

1. El usuario abre el navegador.
2. Ingresa a http://localhost:5000.
3. La solicitud llega al Docker Engine.
4. Docker redirige la petición al contenedor.
5. Flask procesa la solicitud.
6. La aplicación devuelve la respuesta al navegador.

## Ventajas

- Fácil despliegue.
- Entorno reproducible.
- Independencia del sistema operativo.
- Configuración sencilla mediante Docker Compose.