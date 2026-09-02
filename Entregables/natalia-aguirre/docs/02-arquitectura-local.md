# 02 — Arquitectura local

## Servicios

La app corre con un contenedor Docker:

|Contenedor|Imagen|Puerto|
|-|-|-|
|`app`|python:3.11-slim|8080|



## Diagrama local

```
Browser (localhost:3000)
        │
        ▼
  ┌─────────────┐
  │   app       │  python:3.11-slim
  │  :8080      │
  └──────┬──────┘
         │ DATABASE\_URL
         ▼
  ┌─────────────┐
  │    DYNAMODB │ 
  │  :443       │
  └─────────────┘
        │
   \[servicio gestionado de Amazon DynamoDB]

## Cómo levantar la app

```bash
cd product-catalog-mvp/
#comando para compilar el contenedor bajo el nombre mi-api-fastapi
docker build -t mi-api-fastapi .

docker run -d -p 3000:8080 mi-api-fastapi
```

La app queda disponible en:

1. GET /health
Función: Monitorear el estado de la aplicación.
Utilidad: Devuelve un JSON simple para indicarle al balanceador de carga de AWS que el contenedor está funcionando correctamente.
2. GET /products/{product\_id}
Función: Consultar un único producto por su identificador.
Utilidad: Extrae un código product\_id de la URL, busca la información asociada en DynamoDB y la devuelve (o arroja un error 404 si no existe).
3. POST /products
Función: Dar de alta un nuevo artículo en el catálogo.
Utilidad: Recibe los datos del producto en el cuerpo de la petición, valida los campos mediante Pydantic, verifica que el identificador no esté duplicado y lo guarda en la base de datos.
4. GET /products
Función: Listar los productos disponibles.
Utilidad: Recupera los artículos guardados usando un escaneo acotado a un límite determinado (por defecto, los primeros 20 elementos).

5- GET /docs.
Documentación Interactiva Automática.



Para detenerla:

docker stop $(docker ps -q --filter ancestor=mi-api-fastapi)

