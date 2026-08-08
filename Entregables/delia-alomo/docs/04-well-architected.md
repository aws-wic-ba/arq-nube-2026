# 04 - Well-Architected Framework

Para ZeroToTech se decidió enfocar el análisis en los cuatro pilares que la arquitectura serverless propuesta aborda de forma más directa: Seguridad, Fiabilidad, Eficiencia de rendimiento y Optimización de costos. Excelencia Operativa y Sostenibilidad no se profundizan porque, dado el estado actual del proyecto (bajo tráfico, sin equipo de operaciones detrás), no representan un riesgo prioritario.

## Seguridad

¿Cómo protegés datos y secretos? ¿Quién puede acceder a qué?

Autenticación delegada: la autenticación de usuarios queda delegada en Amazon Cognito, en lugar de implementar un sistema propio de login y manejo de contraseñas. Esto evita errores comunes de seguridad (hashing débil, tokens mal generados) que serían responsabilidad mía mantener actualizados.

Validación en cada petición: cada petición al backend pasa primero por API Gateway, que valida el token JWT emitido por Cognito antes de invocar cualquier función Lambda. Ninguna función Lambda queda expuesta directamente a internet.

Menor privilegio: los datos de usuarios y progreso en DynamoDB solo son accesibles desde las funciones Lambda autorizadas, mediante permisos de IAM específicos, no desde el frontend directamente.

Qué mejoraría con más tiempo/presupuesto: agregar AWS WAF delante de CloudFront para mitigar ataques comunes (SQL injection, bots), y habilitar MFA opcional en Cognito para los usuarios que quieran una capa extra de seguridad.

## Fiabilidad

¿Qué pasa si un componente falla? ¿Hay redundancia?

Todos los servicios elegidos (S3, CloudFront, Lambda, API Gateway, DynamoDB, Cognito) son servicios administrados por AWS que ya operan con redundancia multi-AZ por defecto, sin configuración manual.

Al no depender de una instancia EC2 única, no existe un punto único de falla a nivel de servidor: si una función Lambda falla en una ejecución puntual, no tira abajo el resto de la aplicación.

El frontend (S3 + CloudFront) sigue disponible aunque el backend tenga problemas, ya que son capas desacopladas.

Qué mejoraría con más tiempo/presupuesto: definir reintentos automáticos (retry policies) en API Gateway para picos de error transitorios en Lambda, y agregar Amazon SQS para desacoplar operaciones no críticas, como el registro de eventos de progreso.

## Eficiencia de rendimiento

¿Cómo escala la solución ante picos de uso?

CloudFront cachea el frontend en ubicaciones de borde, por lo que un pico de usuarios no impacta el origen (S3) ni genera latencia adicional.

Lambda escala automáticamente ejecutando tantas instancias en paralelo como haga falta ante un pico de peticiones, sin aprovisionar capacidad de antemano.

DynamoDB está pensado para baja latencia a cualquier escala, sin necesidad de tunear índices o configurar un motor de base de datos como haría con RDS.

Qué mejoraría con más tiempo/presupuesto: configurar DynamoDB Accelerator (DAX) si el volumen de lecturas crece mucho, y revisar el tamaño de memoria asignado a cada función Lambda para optimizar tiempos de cold start.

## Optimización de costos

¿Cómo evitás gastos innecesarios?

El modelo serverless implica pagar solo por uso real: sin usuarios activos, el costo de Lambda, API Gateway y DynamoDB (on-demand) es prácticamente cero.

Se descartó EC2 + RDS justamente por este motivo: una instancia corriendo 24/7 factura aunque nadie esté usando la aplicación.

S3 y CloudFront tienen un costo marginal muy bajo para servir contenido estático a la escala actual de ZeroToTech.

Qué mejoraría con más tiempo/presupuesto: configurar alarmas de billing en CloudWatch para detectar gastos inesperados temprano, y evaluar el tier gratuito de cada servicio para dimensionar mejor un presupuesto mensual (ver sección 05).
