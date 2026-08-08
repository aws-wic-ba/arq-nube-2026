# 01 - Descripción del Proyecto

## ¿Qué hace la app?

La aplicación es un **recordatorio de controles médicos y vacunas de rutina**, alojado en la nube de AWS. Permite a cada usuario llevar un seguimiento de los chequeos de salud preventivos que le corresponden según su **edad y sexo**.

Funcionamiento general:

1. **Registro**: el usuario se registra (con opción de cuentas federadas) y completa información básica de fecha de nacimiento y sexo.
2. **Asignación de planilla**: en base a esos datos, el sistema asigna una planilla de controles y vacunas recomendadas (ej. control oftalmológico cada 2 años, analisis bioquimicos, PAP anual, vacuna antigripal anual, colonoscopía/mamografía a partir de cierta edad, etc.).
3. **Carga de historial**: el usuario puede indicar qué controles ya se realizó, cargar la fecha en que los hizo y, opcionalmente, sus resultados.
4. **Recordatorios**: a partir de la fecha del último control, la app calcula y programa una notificación para avisar cuándo corresponde el próximo control.
5. **Registro manual**: el usuario también puede agregar controles o vacunas por fuera de la planilla sugerida (ej. estudios particulares indicados por su médico), de forma manual como asi tambien configurar la periodicidad.

## ¿Por qué la elegí?

Elegí esta idea porque resuelve un problema real y cotidiano: **la mayoría de las personas no recuerda cuándo fue su último control médico ni cuándo corresponde el próximo**, y la prevención en salud depende en gran parte de la constancia en estos chequeos. Además, seria un proyecto interesante para practicar arquitectura en la nube, ya que puedo utilizar varios servicios: base de datos relacional (datos estructurados y relaciones claras), procesamientos simples, autenticación con cuentas federadas (caso de uso muy común en apps reales) y notificaciones a usuario final.

## ¿Quiénes son los usuarios?

- **Público general**: cualquier persona que quiera llevar un control de su salud preventiva, sin necesidad de pertenecer a una institución médica particular. Es el usuario principal de la app.
- **Usuarios registrados**: acceden mediante cuenta propia o cuenta federada, y son quienes cargan y consultan su información personal de salud.

La app está pensada como un servicio directo al usuario final, sin un panel administrativo para terceros. Podría evaluarse a futuro un rol de administrador para mantener actualizado el catálogo de controles/vacunas recomendados por edad y sexo, pero no es parte del alcance inicial.

## Base de datos: qué tipo elegí y por qué
Claramente es necesario incorporar una base de datos para almacenar la informacin de usuarios y su historial médico de forma duradera, persistente y consultable.

Elegí una **base de datos relacional, Amazon RDS serverless (Aurora serverless)** por los siguientes motivos:

- Los datos tienen una estructura clara: un usuario tiene controles/vacunas asociados, que pertenecen a un tipo del "catálogo general" (definida por edad/sexo), y cada registro tiene atributos bien definidos (fecha del procedimiento, resultado, próxima fecha estimada).
- Cantidad y tipo de datos: no se trata de grandes volúmenes de datos no estructurados (como logs o eventos masivos), sino de registros estructurados y de tamaño moderado por usuario.
- Integración con AWS: Amazon RDS ofrece un servicio administrado (backups automáticos, escalado, alta disponibilidad) que simplifica el mantenimiento.
- La variante Serverless es apta dado que se espera un patrón de uso irregular. Los usuarios van a interactuar con la app de forma esporádica (al registrarse, al cargar un control, o cuando recibe una notificación), por lo que no se espera una carga constante de tráfico. La base de datos escala automáticamente según la demanda real, lo cual: reduce costos vs una instancia de RDS fija corriendo 24/7 y evita tener que estimar previamente el tamaño de la instancia necesaria.
