# 01 — Descripción de la Aplicación

## ¿Qué es Ghirba Travel?
**Ghirba Travel** es una plataforma web para agencias de viajes que permite a los usuarios explorar paquetes turísticos (locales e internacionales), consultar detalles de tarifas y realizar reservas de viajes de manera ágil e intuitiva.

Además, cuenta con un **panel de administración restringido** que permite a los operadores de la agencia actualizar precios en tiempo real, dar de baja o dar de alta nuevos paquetes turísticos.

## ¿Por qué Ghirba Travel?
Deriva de Khibra (vocablo árabe para "experiencia" o "pericia".

---

##  ¿Por qué se eligió esta aplicación?
Como Licenciada en Turismo, opté por el desarrollo de una agencia de viajes porque representa un caso de uso clásico y robusto para aplicar **patrones de arquitectura en la nube**:
* Presenta una alta carga de lecturas (usuarios navegando el catálogo de destinos).
* Requiere transaccionalidad segura pero de baja frecuencia de escrituras (confirmación de reservas y gestión de catálogo).
* Presenta **picos de tráfico estacionales** (temporada alta de vacaciones, eventos como CyberMonday o HotSale), lo cual justifica el diseño de una infraestructura elástica y escalable en la nube.

---

## 👥 ¿Quiénes son los usuarios?
1. **Público General / Clientes:** Usuarios que navegan el catálogo, consultan tarifas y envían solicitudes de reserva desde el frontend.
2. **Administradores / Operadores Turísticos:** Personal interno de la agencia que accede mediante autenticación para gestionar los precios, ocultar o publicar nuevos destinos.

---

## 🗄️ Base de Datos: Elección y Justificación
Para **Ghirba Travel** se seleccionó una base de datos relacional: **PostgreSQL**.
Para simplificar la operativa, se eligió que nuestra base de datos sea alojada y procesada en la web por Neon Tech. 


### Justificación:
* **Estructura de Datos Relacional:** Existe una relación clara e íntegra entre las entidades del sistema:
  * **Destinos** (`id`, `nombre`, `descripcion`, `precio`, `moneda`, `imagen`).
  * **Reservas** (`id`, `destino_id`, `nombre_cliente`, `email_cliente`, `fecha_viaje`, `fecha_creacion`).
* **Integridad Referencial (ACID):** Es fundamental garantizar que una reserva quede vinculada de forma consistente a un `destino_id` existente y que las modificaciones de catálogo no dejen registros huérfanos.
* **Escalabilidad y Ecosistema Cloud:** PostgreSQL es soportado nativamente por servicios administrados en la nube como AWS RDS, facilitando la creación de Réplicas de Lectura (*Read Replicas*) y copias de seguridad automáticas.