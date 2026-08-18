# 01 -descripcion

Panel de Cuentas Dashboard: 

Muchos entornos corporativos y equipos comerciales aún gestionan el seguimiento de clientes y la medición de desempeño mediante planillas manuales o herramientas fragmentadas, lo que genera pérdida de información, falta de visibilidad y demoras en la toma de decisiones. Es una aplicación web que brinda claridad informativa, mejora operativa y continua para la toma de decisiones. Sugiere una acción prioritaria (No utiliza IA, utiliza el triage y la información disponible, saca la prioridad en tiempo real y la notifica al ingresar). Brinda información sobre progreso diario, un promedio de la salud de su cartera de clientes, sin olvidar el punto de vista del cliente, quien también puede dejar una valoración o dejar recomendaciones. 

¿Por qué la elegí?

Quería algo que genere valor al desempeño del usuario y la calidad en su toma de decisiones, impulsando una mejora continua en el desarrollo de sus tareas. Si el usuario principal es un Account Manager, el dashboard le brinda información rápida, métricas de seguimiento mensual y diario, triage sobre clientes separados por categorías, también se le notifica de lo urgente al ingresar, lo ayuda en su día a día. 

Usuarios
Empleados corporativos: Para facilitar el registro operativo diario, el seguimiento de tareas y la consulta eficiente de información interna.
Empresarios y Directivos: Para acceder a métricas clave, supervisar el desempeño del negocio y tomar decisiones estratégicas basadas en datos en tiempo real.
Clientes en ventas / Área Comercial: Para gestionar prospectos, hacer seguimiento del embudo de ventas y mejorar la experiencia de atención e interacción con los clientes. 

Base de datos: Amazon RDS PostgreSQL 

Elegí Amazon RDS PostgreSQL porque la app maneja datos estructurados que necesitan estar bien conectados entre sí (usuarios, clientes y evaluaciones).

Confiabilidad: Mantiene los datos exactos y seguros sin pérdidas ni errores.
Alta disponibilidad: La configuración Multi-AZ deja una copia lista en AWS por si falla el servidor principal.
Seguridad y mantenimiento: Queda protegida en una subred privada, mientras AWS se encarga de los respaldos automáticos y actualizaciones.