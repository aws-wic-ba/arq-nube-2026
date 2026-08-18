¿Qué es?

Roversec es una tienda online de cursos de ciberseguridad (seguridad ofensiva y defensiva), con niveles inicial, intermedio y avanzado. El cliente explora el catálogo, arma un carrito, compra con su nombre y correo, y recibe acceso al material.

¿Por qué la elegí?

Se alinea con mi perfil profesional en ciberseguridad y es un e-commerce realista para demostrar elasticidad (escalar ante picos), protección de contenido digital pago y datos de clientes.

¿Quiénes son los usuarios?

La demanda no es constante, ya que se espera un mayor volumen de accesos durante lanzamientos de nuevos cursos, promociones, campañas comerciales y determinados eventos o fechas de mayor actividad. Por este motivo, la arquitectura debe poder adaptar la capacidad de cómputo a variaciones de demanda, evitando mantener recursos sobredimensionados durante los períodos de menor actividad y permitiendo absorber los picos sin afectar la disponibilidad de la aplicación. En función de esto, se incorpora ECS Fargate con Auto Scaling, utilizando métricas de CloudWatch para ajustar la cantidad de tareas según la carga.

Base de datos

Relacional (PostgreSQL). La elección responde a la naturaleza de los datos de la aplicación y, especialmente, del proceso de compra. Una compra tiene un encabezado, uno o varios ítems asociados y un total que debe ser consistente con los cursos adquiridos. Estos datos están relacionados y deben registrarse de forma conjunta: si se registra la compra pero falla el registro de alguno de sus ítems, el sistema podría quedar en un estado inconsistente. Por este motivo, se requiere el uso de transacciones, que permiten aplicar la operación de forma atómica (todo o nada) y mantener la integridad de los datos.

El material de los cursos, como videos y archivos PDF se almacena en Amazon S3.
