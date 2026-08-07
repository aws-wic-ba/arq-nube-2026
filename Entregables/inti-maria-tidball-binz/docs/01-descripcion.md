# 01. Descripción de la aplicación Gentle Task Companion

## Contexto del proyecto y motivación

Diseñé Gentle Task Companion como una herramienta de autocuidado orientada a personas neurodivergentes. En su primera etapa desarrollé un prototipo utilizando Supabase para validar las pantallas y los flujos principales. Al avanzar en la materia de Arquitectura de Nube, decidí transformar ese prototipo en un proyecto de diseño completo.

El objetivo de este trabajo es migrar la aplicación desde un servicio propietario hacia una arquitectura profesional, escalable y portátil. Busco evitar el bloqueo con un proveedor específico y garantizar que todo el sistema pueda ejecutarse tanto en un entorno local self-hosted mediante contenedores como en la nube de AWS utilizando servicios gestionados.

## Qué hace Gentle Task Companion

Gentle Task Companion es una aplicación web progresiva (PWA) orientada a acompañar la rutina diaria de usuarios con TDAH, autismo o estados de alta carga cognitiva. La plataforma reúne seis módulos de apoyo:

1. **Registro de estado de ánimo (Mood Tracker):** Permite registrar el nivel de energía y emoción del día mediante un selector visual directo, facilitando el seguimiento personal a lo largo del tiempo.
2. **Solo tres tareas al día:** Ayuda a bajar la carga cognitiva al enfocar en tres tareas al día. Promueve la finalización de tareas sobre la acumulación. Incluye un estado de 'en progreso' para cada tarea, que permite indicar que se está trabajando en ella y luego marcarla como completada.
3. **Diario de gratitud:** Ofrece un espacio sencillo de escritura rápida para registrar momentos positivos o reflexiones breves durante la jornada.
4. **Botón de Crisis:** Proporciona asistencia inmediata frente a momentos de sobrecarga sensorial o ansiedad. Incluye un asistente visual de respiración guiada y reproducción de audio relajante. Está disponible sin iniciar sesión y funciona fuera de línea.
5. **Tarjetas de comunicación no verbal:** Presentan pictogramas y frases predefinidas para comunicar necesidades básicas o estados emocionales cuando expresarse de forma hablada resulta difícil. Funcionan en modo offline.
6. **API de animalitos cute**: Proporciona imágenes aleatorias de animalitos cute para relajación y entretenimiento. Permite al usuario guardar sus imágenes favoritas para verlas más tarde.

## Perfil de usuarios y privacidad de datos

La aplicación está destinada a personas neurodivergentes y a cualquier usuario que requiera una herramienta estructurada para su bienestar diario. Dado que el sistema almacena información sensible como notas personales y estados de ánimo, la privacidad es una condición fundamental del diseño.

Cada usuario accede únicamente a sus propios datos mediante autenticación basada en tokens JWT. Las peticiones al backend verifican la firma del token antes de procesar cualquier lectura o escritura. Por otro lado, los recursos de contención de emergencia, como el botón de crisis y las tarjetas no verbales, no solicitan credenciales ni guardan registros en el servidor, asegurando acceso inmediato en momentos de necesidad. Estas funcionalidades, además del API de animalitos, están disponibles por fuera de la sesión de usuario autenticado.

## Selección del modelo de datos: NoSQL con API DynamoDB

Para el almacenamiento persistente elegí un modelo NoSQL clave-valor e identifiqué a DynamoDB como la API de referencia por las siguientes razones técnicas:

### Patrón de acceso puramente jerárquico
Toda la información del sistema pertenece a un usuario específico. No existen consultas cruzadas entre usuarios ni relaciones compuestas entre tablas que requieran operaciones JOIN. Las lecturas y escrituras siempre se realizan filtrando por el identificador del usuario autenticado (`USER#<id>`).

### Diseño de tabla única (Single-Table Design)
Estructuré los datos en una sola tabla aplicando el siguiente esquema de claves:

- **Clave de partición (PK):** `USER#<id>`
- **Clave de ordenación (SK):**
  - `MOOD#<timestamp>` para los registros de estado de ánimo.
  - `TASK#<id>` para las tareas (con estado de tres valores: sin empezar / en progreso / completada).
  - `GRAT#<timestamp>` para las entradas del diario de gratitud.
  - `ANIMAL#<id>` para los animalitos guardados y `PROFILE` para los datos del perfil.

Este esquema permite obtener todo el historial de un usuario en una sola consulta de lectura hacia una única partición de la base de datos.

### Beneficios de la elección
- **Latencia constante:** La velocidad de respuesta se mantiene estable sin importar el volumen total de usuarios en la base de datos.
- **Escalabilidad y costo:** En la nube opera bajo demanda, ajustando su capacidad de forma automática y reduciendo el costo a cero cuando no recibe peticiones.
- **Paridad local y nube:** Al usar el SDK estándar de DynamoDB, el backend se conecta a ScyllaDB Alternator (build self-host) o a la DynamoDB emulada por MiniStack (build AWS-emulado) en local, y a Amazon DynamoDB en producción, sin cambiar una línea de código.

