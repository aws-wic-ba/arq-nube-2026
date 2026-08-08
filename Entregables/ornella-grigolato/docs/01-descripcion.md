# Descripción del Proyecto: SaaS de Gestión para Refugios de Animales (MVP)

## ¿Qué hace la aplicación?

En su etapa actual (MVP), la plataforma permite a los refugios y organizaciones rescatistas registrarse y configurar su propia identidad de marca en el sistema. A partir de este registro, la aplicación genera una cuenta de usuario que otorga acceso a un _Dashboard_ privado de administración y, en paralelo, crea y despliega automáticamente una _landing page_ pública personalizada para darle visibilidad online a la organización.

## ¿Por qué la elegiste?

Elegí este proyecto por un lado por mi amor hacía los animales. Encontré en la técnología una forma de aportar un granito de arena a ayudarlos. Resolviendo uno de los obstáculos de muchas ONGs: la falta de presencia digital unificada y profesional, puedo hacer que lleguen a más personas, resultando en más adopciones y donaciones.
Además, sentar las bases de este SaaS representa el escenario ideal para implementar y demostrar una arquitectura _Serverless_ en AWS (escalable, segura y de bajo costo), dejando la infraestructura lista para las futuras funcionalidades de gestión operativa (carga de animales, adopciones, etc.).

## ¿Quiénes son los usuarios?

El sistema interactúa con dos perfiles de usuarios:

- **Usuarios Internos (Administradores del Refugio):** Personal de la organización que registra el refugio, configura la identidad visual y accede al _Dashboard_ privado.
- **Público General:** Usuarios externos que visitan la _landing page_ pública generada para conocer el refugio.

## Base de Datos: Elección y Justificación

Para este proyecto se seleccionó **Amazon DynamoDB**, una base de datos NoSQL.

**¿Por qué se eligió?**

1.  **Flexibilidad del esquema (NoSQL):** La información del perfil de cada refugio y sus configuraciones de marca pueden requerir nuevos atributos a medida que el SaaS evolucione. Una estructura de documentos permite iterar sin migraciones de esquema complejas.
2.  **Integración nativa con Serverless:** Al estar utilizando AWS Lambda y API Gateway, DynamoDB es el estándar de la industria. Permite conexiones directas a través del SDK de AWS sin preocuparse por la gestión de _pools_ de conexiones, lo cual es crítico para el rendimiento de las Lambdas.
3.  **Optimización de Costos y Escalabilidad:** Cumpliendo con el _Well-Architected Framework_, DynamoDB opera bajo el modelo _Pay-as-you-go_ (pago por uso real). Esto asegura que la infraestructura pueda escalar automáticamente si la _landing page_ de un refugio recibe picos de tráfico, manteniendo costos en cero ($0.00) cuando no hay actividad.
