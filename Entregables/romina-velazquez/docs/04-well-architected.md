## 04 — AWS Well-Architected Framework
A continuación se detalla cómo se aplican los seis pilares del Marco de AWS Well-Architected a la arquitectura actual de nuestra aplicación FitConnect (FastAPI, SQLite y Jinja2).

# 1. Excelencia operativa

Automatización y despliegue simple: La aplicación se levanta de forma local con un único comando estandarizando el entorno de ejecución para el desarrollo.

Mantenibilidad del código: El proyecto cuenta con una separación clara de responsabilidades entre el servidor (main.py), las plantillas HTML (templates/) y los estilos de interfaz (Tailwind CSS), lo que facilita la lectura, el mantenimiento y la colaboración en el código.

# 2. Seguridad

Control de acceso y autenticación: La plataforma implementa un sistema de inicio de sesión validando credenciales mediante cookies de sesión (user_id), protegiendo las rutas privadas del dashboard.

Protección de datos: Los datos sensibles de los usuarios y las contraseñas/registros se manejan a través de consultas tipadas y seguras utilizando SQLModel, lo que reduce vulnerabilidades comunes como la inyección SQL.

# 3. Fiabilidad

Recuperación ante fallos locales: Al utilizar SQLite (database.db), los datos de los usuarios, ejercicios y rutinas persisten localmente en un archivo estructurado, evitando la pérdida de información ante cierres inesperados de la aplicación.

Validación de entradas: Los formularios de creación de ejercicios y rutinas contienen validaciones estrictas (required, tipos de datos numéricos y de fecha) para evitar estados inconsistentes en el sistema.

# 4. Eficiencia del rendimiento

Bajo consumo de recursos: Al estar construida con FastAPI y Uvicorn, la app ofrece un rendimiento asíncrono sumamente rápido y liviano, ideal para entornos de baja latencia.

Interfaz optimizada: El uso de Tailwind CSS mediante CDN evita la necesidad de pesados procesos de compilación o empaquetado de assets (bundlers), logrando que la interfaz cargue de manera instantánea en el navegador.

# 5. Optimización de costos

Infraestructura ligera y gratuita: La arquitectura local no requiere servidores pagos en la nube ni contenedores complejos; corre directamente sobre el intérprete de Python nativo y SQLite, lo que elimina costos de licenciamiento o infraestructura.

Aprovechamiento de recursos locales: Utiliza los recursos mínimos del sistema operativo del desarrollador, sin sobrecargar memoria ni procesador.

# 6. Sostenibilidad

Eficiencia energética del software: Al no requerir servicios pesados ni múltiples contenedores Docker concurrentes ejecutándose en segundo plano, el consumo de CPU de la aplicación es prácticamente nulo en estado de reposo, reduciendo la huella energética local durante su desarrollo y pruebas.