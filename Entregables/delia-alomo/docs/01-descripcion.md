# 01 - Descripción de la aplicación

ZeroToTech

## Descripción general

ZeroToTech es una aplicación web diseñada para acompañar a personas que desean iniciar una carrera en tecnología, pero no saben por dónde empezar. Su objetivo no es enseñar programación directamente, sino orientar a los usuarios para que descubran los distintos caminos que ofrece el ecosistema IT y puedan tomar decisiones informadas sobre su aprendizaje y desarrollo profesional.

A través de una experiencia sencilla e interactiva, la plataforma ayuda a identificar intereses, explorar diferentes roles tecnológicos, conocer empresas del sector, descubrir comunidades y fundaciones, acceder a eventos y seguir un roadmap personalizado para comenzar a aprender.

El lema del proyecto es:

"Perdele el miedo a la tecnología, de cero a tu rol IT."

## ¿Por qué elegí esta aplicación?

Elegí desarrollar ZeroToTech porque representa una necesidad real que observé durante mi propio proceso de ingreso al mundo de la tecnología. Muchas personas sienten interés por trabajar en el sector IT, pero abandonan antes de comenzar debido a la gran cantidad de información disponible, la falta de orientación y la creencia de que la tecnología es demasiado difícil o que no es un camino para ellas.

Con este proyecto busco ofrecer una primera guía clara, accesible y amigable que ayude a reducir esa incertidumbre y motive a más personas a dar sus primeros pasos dentro del ecosistema tecnológico.

## Usuarios

La aplicación está dirigida principalmente a personas que recién comienzan su recorrido en tecnología, entre ellas:

- Personas sin experiencia previa en IT.
- Estudiantes de nivel secundario o universitario.
- Personas interesadas en una reconversión laboral.
- Cualquier persona que quiera conocer las diferentes oportunidades que ofrece el sector tecnológico.

Actualmente la aplicación no requiere registro ni autenticación, por lo que cualquier usuario puede acceder a sus funcionalidades desde el navegador.

## Base de datos

La versión actual de ZeroToTech corresponde a un Producto Mínimo Viable (MVP) y no utiliza una base de datos. La información sobre empresas, comunidades, fundaciones y eventos se encuentra integrada en la aplicación, mientras que el progreso del usuario se almacena localmente mediante LocalStorage del navegador.

Esta decisión permite simplificar la arquitectura inicial, reducir la complejidad del desarrollo y evitar la necesidad de un backend durante la primera etapa del proyecto.

En futuras versiones se prevé incorporar cuentas de usuario, progreso sincronizado entre dispositivos, contenido dinámico y nuevas funcionalidades como mentorías y recomendaciones personalizadas.

Nota: Si bien la versión actual no utiliza autenticación ni base de datos, la arquitectura en AWS propuesta en este documento (ver sección 03) está diseñada pensando en esta evolución prevista del proyecto, para no tener que rediseñarla más adelante.
