# 01 - Descripción de la Aplicación

## ¿Qué hace la app?
FitConnect es una aplicación web interactiva diseñada para que los miembros de un gimnasio puedan gestionar de forma digital su entrenamiento diario y mantenerse motivados a través de una comunidad activa.

La plataforma permite a cada usuario:

Registrarse mediante su DNI y autenticarse de forma segura en el sistema.

Armar y personalizar su rutina de ejercicios por día de la semana, especificando los detalles clave de cada movimiento (series, repeticiones y peso).

Consultar el directorio de la comunidad a través de un panel lateral exclusivo, permitiéndoles visualizar quiénes son los otros miembros registrados que entrenan en el mismo gimnasio para fomentar la motivación.

¿Por qué la elegiste?
Se seleccionó este proyecto porque modela un caso de uso real, cotidiano y con un volumen de datos estructurados ideal para aplicar conceptos de arquitectura de software y nube. A diferencia de un simple anotador de notas, esta app introduce relaciones complejas entre entidades (usuarios, credenciales y ejercicios) y requerimientos de seguridad (manejo de contraseñas y privacidad de datos), lo que permite justificar de manera sólida la selección de servicios de infraestructura y estrategias de recuperación ante desastres.

¿Quiénes son los usuarios?
Clientes / Deportistas del gimnasio (Usuarios finales): Personas que asisten al gimnasio de forma regular y buscan dejar de usar planillas de papel o notas sueltas en el celular, prefiriendo una herramienta digital rápida, accesible y conectada con su comunidad para registrar sus marcas y progresos.

Selección de Base de Datos y Justificación
Para este proyecto se seleccionó una Base de Datos Relacional (SQL) —implementada inicialmente con SQLite para el entorno local y pensada para migrar a Amazon RDS (PostgreSQL) en el entorno de producción en AWS.

Justificación de la elección:

Integridad y Relaciones Estructuradas: La app maneja relaciones de uno a muchos (un usuario identificado por su DNI posee múltiples registros de ejercicios asociados a su ID). Una base de datos relacional garantiza la integridad referencial mediante claves foráneas (Foreign Keys), evitando registros huérfanos.

Consistencia (ACID): Al tratarse de datos de progreso personal y rutinas, es fundamental asegurar que las transacciones de guardado de pesos y series se completen de manera exacta y segura.

Escalabilidad del modelo: Permite realizar consultas eficientes (JOINs) para cruzar información de los usuarios con sus respectivas rutinas de manera óptima a medida que la comunidad crece.