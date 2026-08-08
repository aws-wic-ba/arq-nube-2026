 Componentes del Entorno Local

 1.Frontend (frontend): Interfaz web servida en un contenedor Nginx accesible a través de http://localhost:8080.

LocalStack (localstack): Contenedor central que emula los servicios serverless de AWS en el puerto 4566

#Amazon API Gateway & AWS Lambda: Para exponer los endpoints REST e invocar la lógica de negocio en Node.js.

#Amazon DynamoDB: Base de datos NoSQL para almacenar inventario, productos y ventas.

#Amazon SNS: Servicio de notificaciones para las alertas de stock bajo.

![Diagrama arquitectura local](./diagrama%20local.png)

#Cómo levantar la app:

cd app/
docker compose up --build

La app quedará disponible en http://localhost:8080

#Cómo detener la app

Para detener los contenedores manteniendo los datos:

docker compose down

Para detener la app y borrar todos los datos almacenados en la base local:

docker compose down -v