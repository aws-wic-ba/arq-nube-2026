Usuarios y disponibilidad

•	¿Quiénes usan la app? ¿Empleados internos, clientes, público general?
	Clientes que desean reservar cita en algún servicio que brinde el salón
	Empleados o recepcionistas que administran las reservas 
	Administrador del salón
•	¿En qué horarios la usan? → ¿Cuándo podés hacer mantenimiento sin impacto?
El horario de uso será desde las 9;00 am hasta las 8:00 pm , por otro lado , las tareas de mantenimiento ser realizaría durante la madrugada para minimizar el impacto en los usuarios.

•	¿Qué pasa si la app cae en horario pico? ¿Cuál es el impacto real?
El impacto en el negocio serian dificultades con : 
	Los clientes no pueden reservar.
	El personal no puede consultar las citas.
	Se pueden perder clientes.
	Se afecta la imagen del negocio.


Riesgos y reglas
•	¿Qué reglas o regulaciones afectan a tu app? (privacidad de datos, compliance, etc.)
SalonBook almacenará:
	nombres
	teléfonos
	correos electrónicos
	reservas

La aplicación almacenará datos personales de los clientes, por lo que será necesario proteger la información mediante controles de acceso y conexiones seguras (HTTPS).

•	¿Qué riesgos técnicos o de negocio identificás?
Se pueden identificar los siguientes riesgos técnicos.
	Se cae la base de datos.
	Se elimina información por error.
	Falla un contenedor.
	Se vencen las credenciales.
	Un desarrollador borra datos accidentalmente.

Plan de recuperación
•	Escenarios de falla contemplados 
	Caida de ECS : ECS vuelve a iniciar el contenedor.
	Base de datos corrupta : Se restaura desde un backup.
	Error humano y perdida de información : Se recupera desde un respaldo.

•	RTO (Recovery Time Objective): ¿cuánto tiempo podés estar caída?
La aplicación tendrá un RTO de 1 hora. 
•	RPO (Recovery Point Objective): ¿cuántos datos podés perder?
La aplicación tendrá un RPO de 15 minutos.

•	Estrategia de DR : Backup & Restore 
La aplicación tendrá un Backup & Restore porque es la estrategia más económica ya que SalonBook recién está iniciando y porque no se requiere tener otra infraestructura funcionando todo el tiempo.

•	¿Cómo harías backups?
	Amazon RDS realizará backups automáticos con una retención de 7 días.
	Antes de realizar cambios importantes en la aplicación, se crearán snapshots manuales de la base de datos.
	Los respaldos podrán restaurarse mediante Point-in-Time Recovery (PITR) para recuperar la información hasta un momento específico.


Procedimiento de recuperación
	Amazon CloudWatch detecta la falla y registra el evento.
	Se identifica el componente afectado (ECS o RDS).
	Si la base de datos presenta problemas, se restaura el respaldo más reciente utilizando Amazon RDS.
	Si el backend falla, Amazon ECS Fargate vuelve a iniciar el contenedor automáticamente.
	Se verifica que la aplicación funcione correctamente y que los usuarios puedan acceder nuevamente al sistema.
	Finalmente, se informa a los usuarios cuando el servicio haya sido restablecido.
