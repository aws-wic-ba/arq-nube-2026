# ¿Qué hace la app?

**MesaFácil** es una aplicación web para gestión de reservas en restaurantes. Permite que los clientes reserven mesas en línea y que los administradores del local gestionen la disponibilidad y la agenda diaria.

## ¿Por qué la elegí?

Muchos restaurantes todavía coordinan reservas por teléfono o WhatsApp, lo que genera superposiciones, olvidos y mala experiencia para los clientes. MesaFácil resuelve ese problema con una interfaz simple y sin fricción, mejorando la organización y la satisfacción del cliente.

## ¿A quién está dirigida?

Restaurantes pequeños y medianos que necesitan digitalizar su sistema de reservas, y sus clientes que buscan comodidad al reservar.

## Base de datos: MySQL

Elegi una base de datos **relacional** porque los datos tienen relaciones claras: clientes → reservas → mesas. Necesitamos consistencia transaccional para evitar que dos clientes reserven la misma mesa en el mismo horario. MySQL además es ampliamente soportado en AWS RDS y ofrece facilidad de administración y escalabilidad.
