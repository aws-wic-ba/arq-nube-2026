01 — Descripción de la App
¿Qué hace la app?
StockFlow es una aplicación web y móvil de Punto de Venta (POS) y gestión de inventario. Permite a los comercios registrar ventas en tiempo real, descontar automáticamente los productos del stock disponible y disparar alertas automatizadas cuando un artículo alcanza su nivel mínimo de existencias.

¿Por qué la elegiste?
Elegí este caso de uso porque resuelve un problema operativo real y muy común en pequeños y medianos comercios. Actualmente trabajo en un emprendimiento de artículos regionales y es un tema que si no está bien resuelto, genera complicaciones y una mala experiencia del cliente. Representa además un escenario técnico excelente para aplicar una arquitectura Serverless en la nube: permite manejar variaciones de tráfico (como los picos de ventas en determinados horarios) pagando estrictamente por el tiempo de cómputo utilizado, al mismo tiempo que garantiza la consistencia transaccional de los datos.

¿Quiénes son los usuarios?
Los usuarios de la plataforma son internos al negocio:

Propietarios / Administradores: Quienes dan de alta los productos en el catálogo, definen los umbrales de stock mínimo, gestionan los precios y reciben las alertas de reabastecimiento.

Vendedores / Operadores de Caja: Quienes utilizan la interfaz rápida de Punto de Venta en el mostrador (o desde una tablet/celular) para registrar las compras de los clientes y procesar el cobro.

Base de Datos: Amazon DynamoDB
Para la persistencia de datos elegí utilizar Amazon DynamoDB (una base de datos NoSQL de tipo clave-valor y documentos).

Justificación:

Velocidad: Ofrece latencias de un solo dígito de milisegundo a cualquier escala, lo cual es crítico en un entorno de punto de venta donde no debe haber demoras al cobrar.

Consistencia Transaccional: A través de la API TransactWriteItems, DynamoDB permite agrupar operaciones. Esto asegura que el registro del ticket de venta y el descuento del stock del producto se ejecuten de forma atómica (si una falla, ninguna se aplica), evitando inconsistencias fatales en el inventario.

Modelo Serverless: Al ser un servicio completamente administrado, no requiere aprovisionar servidores, parchear software ni gestionar la capacidad en reposo, alineándose perfectamente con el objetivo de optimización de costos y mantenimiento cero.