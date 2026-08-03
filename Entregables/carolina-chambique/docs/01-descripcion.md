# 01 — Descripción de CloudDesk

## Qué hace


CloudDesk es una aplicación para organizar, conservar y compartir documentos con otras personas. Permite subir archivos, asignarles una categoría, indicar una persona responsable, buscarlos, descargarlos y eliminarlos.

Elegí crear CloudDesk a partir de una experiencia personal. Cuando perdí el acceso a mi cuenta universitaria, también perdí los archivos que tenía almacenados en Drive y no pude recuperarlos. Esa situación me hizo pensar en la importancia de contar con una aplicación donde pueda organizar mis archivos, conservarlos de forma segura y compartirlos fácilmente con mis compañeros.

## Usuarios

Los usuarios principales serían estudiantes universitarios que trabajan juntos, compañeros de trabajo e integrantes de distintos proyectos. La aplicación busca evitar que los documentos queden dispersos entre cuentas personales, correos electrónicos y conversaciones de WhatsApp.

## Datos

Para los metadatos, como el nombre del documento, su categoría y la persona responsable, elegí PostgreSQL. Ya tengo experiencia utilizando esta base de datos y me resulta una opción confiable para trabajar con datos relacionados.

Los archivos no se guardan directamente dentro de PostgreSQL. Localmente se almacenan en un volumen de Docker y, en la arquitectura AWS, se guardarían en Amazon S3. Elegí S3 porque está diseñado para almacenar archivos y permite utilizar versionado para recuperar documentos eliminados o modificados por error.

    

## Funcionalidades verificables

1. Inicio con estadísticas, búsqueda y filtro por categoría.
2. Carga validada de formatos de oficina, imágenes y texto.
3. Descarga con nombre original y eliminación con confirmación.
4. Persistencia independiente para base y archivos.
5. Endpoint `/health` que comprueba aplicación y base.
