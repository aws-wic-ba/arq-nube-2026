# 01 — Descripción de la aplicación

## ¿Qué hace la app?

ShibaShop es una aplicación web de comercio electrónico con carrito de compras. Tiene dos páginas:

- **Catálogo**: lista los productos con precio y stock, y permite agregarlos al carrito.
- **Carrito**: muestra los productos elegidos con subtotales y total, permite eliminar ítems y confirmar la compra. Además recomienda productos con un bloque de "quienes compraron esto también llevaron", calculado a partir de los pedidos anteriores.

Al confirmar, la app registra el pedido y descuenta el stock en una sola operación.

## ¿Por qué la elegí?

Durante mucho tiempo vendí artículos en MercadoLibre. De ahí salió la idea: creo que podría vender mis productos directamente desde una aplicación propia.

Un marketplace resuelve muchas cosas. Trae el tráfico, procesa los pagos y aporta la confianza que una tienda desconocida no tiene. A cambio se queda con una comisión de cada venta y con la relación con el cliente.

Lo que más quiero manejar yo es el método de entrega. En el marketplace el envío va por el canal que impone la plataforma. No elijo el correo, ni los plazos, ni las zonas, y no puedo ofrecer retiro en un punto acordado o entrega en mano. El envío es la parte de la compra donde más cosas salen mal y donde más reclamos aparecen, y hoy es sobre la que menos control tengo.

Con una tienda propia me quedo con el margen, con el cliente y con la decisión de cómo se entrega. Pero también me quedo con un problema que antes no era mío: si la tienda se cae, se cae por mi culpa.

Eso es lo que me interesó del ejercicio. La pregunta deja de ser si sé programar un carrito y pasa a ser qué infraestructura hace falta para que una tienda propia sea lo bastante confiable como para justificar dejar el marketplace. Dentro de eso hay dos cosas que me preocupan en particular: cómo escalar ante las fechas fuertes (Día del Niño, Día de la Madre, Navidad, Cyber Monday, Hot Sale) y cómo manejar muchas compras al mismo tiempo sin vender stock que no tengo.

Más adelante, una tienda propia también me permitiría vender a clientes de otros países, algo que atada a la plataforma no puedo hacer.

## ¿A quién está dirigida?

A una tienda mediana con campañas: volumen constante durante todo el año, con picos previsibles en las fechas comerciales fuertes.

Hay dos tipos de usuarios y sus necesidades son distintas:

- **Clientes** (público general). Navegan, arman el carrito y compran. Es el flujo crítico: si no funciona, no hay ventas.
- **Equipo interno.** Carga productos y controla stock. Si no está disponible un rato, se trabaja más tarde.

Elegí este perfil porque es el que hace interesante el problema. Una tienda que concentra buena parte de su facturación anual en unos pocos días de campaña no tolera estar caída justo esos días. Ese requisito, aguantar los picos sin pagar esa capacidad los otros once meses, ordena todas las decisiones que siguen.

## Base de datos: PostgreSQL

Elegí una base relacional. Los datos tienen relaciones fijas y claras (`productos ──< pedido_items >── pedidos`), pero la razón principal es el stock.

Confirmar una compra implica tres cosas que tienen que pasar todas o ninguna: crear el pedido, insertar sus ítems y descontar el stock. Si el proceso se corta en el medio, no puede quedar un pedido sin ítems ni stock descontado sin venta. Una transacción de PostgreSQL me da esa garantía.

También hay un problema de concurrencia concreto. Si queda una sola unidad y dos personas confirman al mismo tiempo, las dos podrían leer "stock = 1" y las dos venderla. Lo resuelvo con `SELECT ... FOR UPDATE`, que bloquea la fila hasta que la primera transacción termina. Vender stock que no existe obliga a cancelar la compra y devolver el dinero, así que prefiero evitarlo en la base antes que intentar coordinarlo desde el código.

### ¿Por qué no una base NoSQL?

DynamoDB sería una buena opción para el catálogo, que recibe muchas más lecturas que escrituras. El problema es el checkout: las transacciones que tocan varias tablas a la vez son su punto flojo, y son justamente el centro de esta aplicación.

Podría usar las dos bases, cada una para lo suyo, pero eso significa mantener dos tecnologías y tenerlas sincronizadas. Para el volumen de esta tienda no vale la pena.

## Alcance

Quedaron afuera cosas que un e-commerce real necesita: login de usuarios, pasarela de pago, panel de administración y gestión de entregas.

**Sobre el login**, cuando lo sume no pienso guardar contraseñas. Usaría **Amazon Cognito**, que permite dos cosas que me interesan: federar con Google o Apple, para que la persona entre con una cuenta que ya tiene, y **magic link**, que envía un enlace al mail en lugar de pedir una contraseña. La razón de fondo no es la comodidad sino la seguridad: **si no guardo contraseñas, no puedo filtrarlas.** Es la forma más efectiva de reducir esa superficie, y encaja con lo que planteo sobre protección de datos personales en [06-disaster-recovery.md](./06-disaster-recovery.md).

La última la menciono aparte porque es la razón principal por la que querría una tienda propia. No está implementada, pero no cambiaría la arquitectura propuesta. Serían un par de tablas más en la misma base y encajan en el mismo modelo: elegir un método de entrega con cupo limitado tiene el mismo problema de concurrencia que descontar stock, y se resuelve igual.
