# 04 - Well-Architected Framework


## Excelencia Operativa

* Monitoreo centralizado con CloudWatch, que junta logs del backend y métricas de todos los componentes, dando visibilidad de qué está pasando sin tener que revisar cada servicio por separado.

* Para el despliegue de cambios, la app ya está containerizada, lo que permite que la misma la imagen se despliegue igual en local y en AWS, evitando el clásico problema de "en mi máquina funciona". Al correr en ECS asociado a un ALB, una nueva versión del backend se puede desplegar de forma progresiva, sin interrumpir el servicio (ECS reemplaza versiones viejas por nuevas una vez que las nuevas pasan el health check).

**Mejoraría:**
Agregar alarmas _proactivas_ en CloudWatch (no solo dashboards) que avisen antes de que un problema impacte o sea percibido por los usuarios. Es decir, tener la capa de "reacción automática" sobre los datos de los dashboards, eso requiere tiempo de análisis para afinar bien los objetivos y umbrales; y presupuesto si se quiere diseñar alarmas más complejas.

## Seguridad

* La autenticación de usuarios se delega a Amazon Cognito, en lugar de manejar contraseñas de forma manual en el backend. 
* La base de datos (RDS Serverless) y el backend (Fargate) viven en subredes privadas dentro de la VPC, sin exposición directa a internet.
* Se agregó NAT Gateway que permite que el backend inicie conexiones salientes (por ejemplo, hacia SNS o Cognito) sin necesidad de abrir una puerta de entrada. De esta forma el tráfico entrante desde internet sigue sin poder llegar directamenta al backend ni a la DB.

**Mejoraría:**
* Me escapa un poco el tópico, pero don Claude me sugirió como opción, sumar un mecanismo de rotación periódica de credenciales de la base de datos.
* Otra sugerencia evaluada era reemplazar NAT Gateway por VPC Endpoints (uno por cada servicio de AWS que necesita alcanzar el backend). Como ventaja presenta un aislamiento mayor, directamente no sale a internet, habla directamente "punto a punto" (privado) con esos sevicios de AWS dentro de la propia VPC. 
Desventaja que veo: es necesidad de ir agregando manualmente estas conexiones (y saber cuáles son efectivamente) si a futuro deseo integrarlo con otro servicios. A su vez, para el volumen de tráfico 'saliente' que tendría la app hoy, el ahorro de este reemplazo del NAT es complejo de comparar (cada VPC Endpoint tiene costo por hora, que a 3-4 endpoints), el total puede ser similar o más costoso que un solo NAT Gateway.

## Fiabilidad

* Uso de un Load Balancer para ECS: si un health check falla, el ALB deja de enviarle tráfico y ECS la reemplaza automáticamente por una nueva, sin intervención manual. 
* A nivel de contenedores (con Docker Compose) se definieron `healthcheck` y `restart: unless-stopped` para que cada componente se recupere solo ante una caída puntual. 
* El uso de Aurora Serverless, ofrece redundancia y recuperación propias, sin necesidad de administrar réplicas manualmente.

**Mejoraría:**
* Despliegue real Multi-AZ: Las tareas de Fargate por defecto todas en misma AZ (si hay solo una subred accesible disponible), si cae esa AZ, cae todo el backend aunque haya redundacia por las réplicas. Es necesario configurar el servicio para que use subredes en al menos 2 o 3 AZs distintas. Para Aurora serverless Multi-AZ hay que activarlo y se paga aparte -instancias ociosas/standby-.
* Probar los backups automáticos de la DB con pruebas periódicas de restauración (no solo confiar en que existen, sino validar que funcionan). Implica levantar intancia temporal de la DB y dedicar tiempo humano al testeo.

## Eficiencia de Rendimiento

* Los componentes elegidos escalan solos ante la demanda en lugar de capacidad fija. Fargate puede correr más tareas si aumenta el tráfico, y Aurora Serverless ajusta su capacidad de cómputo según el uso real de la DB. 
* El frontend, con CloudFront, responde rápido sin importar cuántos usuarios lo consulten, ya que debería distribuir la carga en ubicaciones cercanas a cada usuario.

**Mejoraría:**
Si tuviera tiempo, configurar políticas de auto scaling explícitas en Fargate (basadas en CPU/memoria o en cantidad de requests) en lugar de un número fijo, y realizar tests de carga para validar cómo se comporta la app ante picos reales antes de que ocurran en producción.

## Optimización de Costos

* La elección de Fargate (en vez de EC2) y Aurora Serverless (en vez de una instancia de RDS fija) responde directamente a este pilar. Mi objetivo es solo pagar por capacidad que escala con el uso real, es más eficiente que mantener servidores corriendo 24/7 con utilidad ociosa la mayoría del tiempo. 
* Servir el frontend como archivos estáticos en S3, también evita pagar por cómputo para algo que no lo necesita.
* Sobre el NAT Gateway, tomé la decisión de usar uno solo en vez de uno por AZ. Por el momento, no se justifica el riesgo real para tener redundancia. Si el backend pierde temporalmente la salida a internet por un problema en la AZ elegida, sigue respondiendo a los usuarios, porque el core del funcionamiento no depende del NAT para la experiencia del usuario.

**Mejoraría:**
Evitar sobre-provisionar "por las dudas". Como en el punto anterior: revisaría periódicamente métricas de uso real para ajustar los límites mínimos/máximos de escalado tanto de Fargate como de Aurora Serverless.

## Sostenibilidad

En esta idea de app, el uso de Fargate y Aurora Serverless reducen el "desperdicio de recursos". Creo que con estas decisiones queda cubierto este pilar. No se me ocurre otras estrategias de sostenibilidad aplicable. Seguramente habrá, pero no las tengo en mi conocimiento.