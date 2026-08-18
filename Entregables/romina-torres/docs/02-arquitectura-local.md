La aplicación se ejecuta mediante dos contenedores definidos en docker-compose: web (Node.js + Express), que sirve las páginas y expone la API, y db (PostgreSQL), que almacena los cursos y las compras. El volumen datos_db permite conservar los datos de PostgreSQL aunque el contenedor sea detenido o recreado. La base de datos solo es accesible desde el contenedor web a través de la red interna de Docker, por lo que no se expone directamente a Internet.

La separación en contenedores facilita la migración de cada componente a un servicio administrado en AWS: el componente web puede ejecutarse posteriormente en un servicio de cómputo administrado como ECS con Fargate, mientras que PostgreSQL puede migrarse a Amazon RDS. De esta forma, la arquitectura local mantiene una separación clara entre aplicación y persistencia que luego se conserva en la arquitectura cloud.

Para levantar la aplicación localmente: ejecutar docker compose up desde la carpeta de la aplicación.
