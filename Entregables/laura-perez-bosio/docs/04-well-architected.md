# 04 — Well-Architected Framework

Revisé los seis pilares. Para cada uno cuento qué decidí y qué mejoraría si tuviera más tiempo o presupuesto.

## 1. Excelencia Operativa

**Qué decidí.** La misma imagen Docker que corro localmente se guarda en ECR y es la que descargan las instancias EC2. Eso evita los problemas de "en mi máquina andaba", porque el artefacto que llega a producción es idéntico al que probé.

El Launch Template define cómo nace cada instancia: AMI, tipo, rol de IAM y script de arranque. Las instancias que crea el Auto Scaling son todas iguales y ninguna se configura a mano.

Los logs de la aplicación van a un grupo de logs de CloudWatch en vez de quedarse en cada máquina. Es la única forma de investigar un error cuando no sé en cuál instancia ocurrió, y sobre todo cuando esa instancia pudo haber sido dada de baja por el escalado.

Configuro alarmas de CloudWatch que avisan por SNS sobre cuatro cosas: cantidad de instancias sanas en el target group, porque si baja de dos perdí la redundancia entre zonas; respuestas 5xx del balanceador, que significan que la tienda le está devolviendo errores a clientes reales; latencia alta, para ver la degradación antes de que se convierta en caída; y espacio libre en RDS, porque un disco lleno frena las escrituras y deja de entrar pedidos.

Para actualizar la app hago un reemplazo gradual de instancias en el Auto Scaling Group. Entran las nuevas con la imagen actualizada y salen las viejas de a una, mientras el balanceador va sacando de rotación las que se apagan. No hace falta ventana de caída.

**Qué mejoraría.** Definir la infraestructura como código, con CloudFormation. Hoy la arquitectura está diseñada pero no escrita en un archivo, y eso empeora directamente el tiempo de recuperación que declaro en [06](./06-disaster-recovery.md): rehacer todo después de un desastre sería manual y lento. También armaría un pipeline de despliegue automático, porque hoy el despliegue es manual y eso invita al error justo cuando hay más presión.

## 2. Seguridad

**Qué decidí.** Que no esté expuesto nada que no lo necesite. Solo el balanceador recibe tráfico de internet. Las instancias EC2 no tienen IP pública y la base está en una subred privada de datos, un nivel más adentro.

Los Security Groups se encadenan entre ellos: el de la app solo acepta tráfico del balanceador, y el de la base solo del grupo de la app. Para llegar a la base hay que haber pasado por los dos anteriores. Como la regla apunta al grupo y no a una IP, sigue funcionando cuando el Auto Scaling crea instancias nuevas.

Las credenciales de la base y la clave de sesión están en Secrets Manager, y la aplicación las pide al arrancar usando el rol de IAM de la instancia. Así la contraseña no queda escrita en el Launch Template, ni en la AMI, ni en el repositorio. En local el equivalente es el `.env`, que está en el `.gitignore`.

Uso HTTPS con certificado de ACM, y cifrado en reposo en RDS, en los snapshots y en S3.

Las instancias no tienen claves de acceso guardadas: usan un rol de IAM con los permisos mínimos que necesitan, que son leer un secreto puntual, escribir en su grupo de logs y bajar la imagen de ECR.

Delante del balanceador pongo WAF con las reglas administradas contra inyección SQL y cross-site scripting, más un límite de peticiones por IP. Es una tienda que procesa pedidos, así que es una capa barata para el riesgo que cubre.

**Qué mejoraría.** Activar la rotación automática de la contraseña de RDS desde Secrets Manager. La capacidad ya está, falta configurarla y verificar que la aplicación tome la contraseña nueva sin quedarse colgada.

## 3. Fiabilidad

Es el pilar central de esta arquitectura, porque el requisito de partida es que la tienda no se caiga durante una campaña.

**Qué decidí.** Que el cómputo no dependa de una sola zona. Las instancias están repartidas en dos zonas de disponibilidad con un mínimo de dos, así que si se cae una zona entera la tienda sigue funcionando con capacidad reducida.

Con la base tomé una decisión distinta, y es la más discutible de todo el trabajo: **Multi-AZ solo durante las campañas.** Durante esas fechas hay una standby con réplica sincrónica que se promueve sola si la primaria falla, y como la réplica es sincrónica no se pierde ninguna transacción confirmada. El resto del año la base es Single-AZ y una falla obliga a restaurar desde snapshot, con un tiempo de recuperación de horas en lugar de minutos.

Lo elegí porque el volumen de ventas fuera de campaña es mucho menor y prefiero ese ahorro. La activación está automatizada con EventBridge y Lambda para no depender de acordarme, con una alarma que verifica el estado real de la instancia antes de cada fecha. El razonamiento completo está en [03](./03-arquitectura-aws.md) y las consecuencias sobre los tiempos de recuperación, en [06](./06-disaster-recovery.md).

El health check hace algo útil: `/health` no devuelve un "ok" vacío, sino que verifica que la conexión a PostgreSQL responda y devuelve 503 si no. Una instancia que perdió la base sale de rotación en lugar de seguir recibiendo clientes, y además el Auto Scaling la reemplaza.

La consistencia bajo concurrencia está probada. El checkout usa `SELECT ... FOR UPDATE` dentro de una transacción, y el script [`app/test/concurrencia.js`](../app/test/concurrencia.js) deja una unidad en stock y lanza 25 compradores a la vez: una compra confirmada, 24 rechazadas, stock final en cero y sin registros inconsistentes ([evidencia](../evidence/test-concurrencia.txt)). La diferencia práctica es entre 24 clientes con una compra confirmada de algo que no existe, con la cancelación y la devolución que eso implica, y 24 clientes que simplemente vieron que se agotó.

**Qué mejoraría.** Sumar una tercera zona, para que perder una signifique perder un tercio de la capacidad y no la mitad. Y probar de verdad el plan: forzar un failover de RDS y dar de baja instancias a propósito para confirmar que la recuperación funciona. Un plan que nunca se probó es una hipótesis.

## 4. Eficiencia de Rendimiento

**Qué decidí.** Escalar de dos maneras, porque los picos de esta tienda tienen dos formas distintas. Hot Sale y Cyber Monday son picos abruptos que arrancan a una hora exacta, mientras que Día del Niño, Día de la Madre y Navidad son rampas que suben durante semanas (el detalle está en [03](./03-arquitectura-aws.md)). El escalado por uso de CPU cubre bien las rampas. Los picos abruptos necesitan escalado programado, porque esperar a que el sistema reaccione significa que la capacidad nueva llega cuando la ola ya pasó.

Las imágenes van a S3 y se sirven por CloudFront. Son la mayor parte de los bytes de un e-commerce, así que sacarlas de las instancias hace que en un pico la mayoría del tráfico ni toque mi infraestructura.

El HTML no se cachea, y es a propósito. El catálogo muestra stock en vivo, y cachearlo llevaría a que la gente comprara productos ya agotados. Prefiero pagar el costo de generarlo en cada visita.

**Qué mejoraría.** Hacer pruebas de carga antes de una campaña, para saber cuántas instancias necesito en vez de estimarlo. Y revisar el tipo de instancia con métricas reales: elegí un tamaño razonable, pero sin datos de producción es una suposición.

## 5. Optimización de Costos

**Qué decidí.** Pagar la capacidad base con descuento y el pico a demanda. El piso de tráfico está todo el año, así que lo cubro con un Savings Plan. Los picos los absorbe el Auto Scaling a precio on-demand, y así pago la capacidad extra solo los días que la uso. Tener seis instancias prendidas doce meses para cubrir unos pocos días de campaña costaría mucho más.

Con la base apliqué la misma idea que con el cómputo: **pagar la protección cara solo cuando hace falta.** Multi-AZ cuesta el doble que Single-AZ, así que lo activo únicamente durante las campañas, que es cuando una caída duele de verdad. Son unos 492 dólares menos por año. La contrapartida es que el resto del año no tengo failover automático, y eso lo asumo explícitamente en [06](./06-disaster-recovery.md).

Los estáticos van a S3 en vez de obligarme a escalar cómputo para servir imágenes. Y guardo el carrito en PostgreSQL, que ya tengo, en lugar de sumar ElastiCache solo para las sesiones: me ahorra un servicio entero y resuelve mejor el problema, como explico en [03](./03-arquitectura-aws.md). Tampoco mantengo un entorno de pruebas prendido todo el tiempo: lo levanto cuando lo necesito.

Hay un punto que en mi caso es parte de este pilar: AWS factura en dólares y yo vendo en pesos. Si el dólar sube, mi costo sube sin que haya cambiado nada técnico ni haber vendido más. Además, cerca del 80% de la factura es costo fijo, o sea que se paga igual en un mes de ventas flojas. Eso le da al escalado automático un valor extra, porque convierte parte del costo fijo en variable. Y obliga a pensar dos veces los Savings Plan, que dan descuento pero comprometen un año en una moneda que no es la de mis ingresos. El detalle está en [05-costos.md](./05-costos.md).

**Qué mejoraría.** Configurar AWS Budgets con alertas, para enterarme de un desvío el día que pasa y no cuando llega la factura. Y usar reglas de ciclo de vida en S3 para mover las imágenes viejas a clases de almacenamiento más baratas.

## 6. Sostenibilidad

**Qué decidí.** El escalado automático es lo que más impacto tiene. No hay instancias encendidas sin usarse esperando un pico que ocurre pocos días al año, y menos recursos ociosos es a la vez menos consumo y menos costo. Servir los estáticos desde CloudFront también ayuda, porque reduce el tráfico que tiene que viajar desde la región hasta el usuario.

**Qué mejoraría.** Ajustar el tamaño de las instancias con datos reales en vez de elegirlo por las dudas. Sobredimensionar por miedo a quedarme corta significa recursos encendidos que nunca se usan.

## Resumen

| Pilar | Decisión principal | Mejora pendiente |
|-------|-------------------|------------------|
| Excelencia Operativa | Misma imagen Docker en local y en AWS, logs centralizados | Infraestructura como código |
| Seguridad | Security Groups encadenados, secretos en Secrets Manager | Rotación automática de credenciales |
| Fiabilidad | Dos zonas de cómputo, Multi-AZ en campañas, concurrencia probada | Probar el failover de verdad |
| Eficiencia de Rendimiento | Escalado programado antes de cada fecha fuerte | Pruebas de carga |
| Optimización de Costos | Capacidad base con descuento y pico on-demand | Alertas de presupuesto |
| Sostenibilidad | Sin capacidad ociosa fuera de los picos | Ajustar el tamaño con datos reales |
