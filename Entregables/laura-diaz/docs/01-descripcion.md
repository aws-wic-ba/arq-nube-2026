# 01 — Descripción de la aplicación

## ¿Qué hace la app?

**RelocaPet** es una app que ayuda a los dueños a mudarse de país con su mascota, funciona como un buscador de requisitos por ruta (país origen + país destino + especie -> checklist de salida/entrada + política de la aerolínea), además de mostrar un listado de tips/experiencias de otras personas que ya hicieron esa ruta.

## ¿Por qué la elegiste?

La elegí porque hace un año me mudé desde Emiratos Árabes Unidos (Dubai) a Uruguay con mi gatito Román Riquelme. Si bien hay agencias que se dedican a hacer los trámites necesarios para el traslado, generalmente es un servicio muy costoso y no todos tienen los medios económicos para contratarlo. También era muy común que personas que se iban de Dubai abandonen a sus mascotas por la complejidad de los papeleos.

En mi caso, hacer la búsqueda de todos los requerimientos fue muy estresante, y por eso deseé tener una plataforma donde encontrar información centralizada + opiniones de otras personas que ya pasaron por lo mismo.

## ¿Quiénes son los usuarios?

Público en general que busque mudarse de país con su mascota y yo (admin para la carga de datos requisitos/aerolíneas).

## Si usás base de datos: qué tipo elegiste y por qué. Si no necesitás base de datos, explicá por qué no.

Utilicé una base de datos relacional (PostgreSQL) porque las consultas de la app son de tipo "checklist por país origen + país destino + especie", lo cual requiere joins entre tablas (país, especie, requisito, aerolínea).
