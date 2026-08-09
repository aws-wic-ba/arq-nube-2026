# SalonBook

## ¿Qué hace la aplicación?

**SalonBook** es una plataforma web que permite a los salones de belleza gestionar sus servicios, empleados y reservas en línea. Los clientes pueden consultar la disponibilidad y agendar citas de forma rápida y segura desde cualquier dispositivo con acceso a Internet.

## ¿Por qué se eligió este proyecto?

Se eligió **SalonBook** porque es una aplicación útil y con potencial comercial que resuelve una necesidad real de los salones de belleza: la organización de citas y horarios.

Además, este proyecto permite aplicar conceptos de arquitectura de software y computación en la nube, tales como:

- Diseño de bases de datos.
- Desarrollo de APIs.
- Contenerización con Docker.
- Seguridad de aplicaciones.
- Escalabilidad.
- Recuperación ante desastres.

## Usuarios de la aplicación

La plataforma está dirigida a los siguientes tipos de usuarios:

- **Clientes:** pueden registrarse, consultar los servicios disponibles y reservar citas.
- **Administradores:** gestionan los salones, empleados, servicios, horarios y reservas.

## Base de datos

Se utilizará **PostgreSQL** como base de datos relacional.

La elección de PostgreSQL se debe a que la aplicación requiere almacenar y relacionar información de diferentes entidades, tales como:

- Usuarios
- Salones
- Empleados
- Servicios
- Reservas

Una base de datos relacional garantiza la integridad y consistencia de la información mediante relaciones entre tablas y restricciones, ayudando a evitar problemas como reservas duplicadas y facilitando el crecimiento futuro de la plataforma.

