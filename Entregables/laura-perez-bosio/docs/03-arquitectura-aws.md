# 03 — Propuesta de arquitectura en AWS

Esta es una propuesta de diseño. No desplegué nada en AWS: el alcance del TP es la arquitectura y su justificación. El diagrama está en [`diagrams/arquitectura-aws.png`](../diagrams/arquitectura-aws.png).

## Punto de partida

La aplicación local son dos contenedores en una sola máquina. Si esa máquina se apaga, no hay tienda. Lo que busco al llevarla a AWS es que ningún componente único pueda dejar la tienda abajo, y que aguante los picos de campaña sin tener que pagar esa capacidad los otros once meses del año.

## Servicios propuestos

| Capa | Servicio | Función |
|------|----------|---------|
| DNS y CDN | Route 53 y CloudFront | Resuelve el dominio y cachea los estáticos cerca del usuario |
| Seguridad de borde | ACM y AWS WAF | HTTPS, y filtrado de inyección SQL, XSS y bots |
| Balanceo | Application Load Balancer | Reparte entre zonas y hace health checks |
| Cómputo | EC2 con Auto Scaling Group | Corre la app en varias instancias |
| Imágenes Docker | ECR | Guarda la misma imagen que uso localmente |
| Base de datos | RDS PostgreSQL Multi-AZ | Datos transaccionales con réplica en otra zona |
| Objetos | S3 | Imágenes de producto y archivos estáticos |
| Secretos | Secrets Manager | Credenciales de la base y clave de sesión |
| Monitoreo | CloudWatch y SNS | Logs, métricas, alarmas y avisos por mail |
| Automatización | EventBridge y Lambda | Activan Multi-AZ antes de cada campaña y disparan los correos de carritos abandonados |
| Correo | Amazon SES | Envía las recomendaciones por mail *(propuesto, no implementado)* |
| Backups | Snapshots de RDS | Retención y recuperación |

## Red

La VPC está repartida en dos zonas de disponibilidad, con tres tipos de subredes.

| Subred | Qué contiene | ¿Alcanzable desde internet? |
|--------|--------------|------------------------------|
| Pública | ALB y NAT Gateway | Sí |
| Privada de aplicación | Instancias EC2 | No, salen por el NAT |
| Privada de datos | RDS primaria y standby | No |

Las instancias EC2 no tienen IP pública: solo reciben tráfico del balanceador. La base está un nivel más adentro todavía.

Los Security Groups se encadenan por referencia entre ellos, en lugar de por rangos de IP:

```
Internet ──▶ SG-alb (443 desde 0.0.0.0/0)
              └──▶ SG-app (3000 solo desde SG-alb)
                     └──▶ SG-db (5432 solo desde SG-app)
```

Con esto, para llegar a la base hay que haber pasado antes por el balanceador y por la aplicación. Y como la regla apunta al grupo y no a una dirección, sigue siendo válida cuando el Auto Scaling crea instancias nuevas con otras IP. Es la misma idea del `docker-compose.yml` local, donde la base no publica el puerto 5432 al host.

## Justificación de las decisiones

### EC2 con Auto Scaling, y no Fargate

Elegí EC2 porque me parece la opción más versátil y porque es la que más conozco. Poder elegir el tipo de instancia y entrar a la máquina si algo se comporta raro me da un margen que con un servicio más cerrado no tendría, y para una primera propuesta prefiero apoyarme en lo que entiendo bien.

También me gusta poder elegir un Savings Plan. Mi tienda tiene un piso de tráfico que está prendido todo el año, así que comprometerme por esa capacidad base me baja el precio sin agregar riesgo: esas instancias van a estar encendidas de todos modos. Fargate cobra por vCPU y memoria por segundo y no tiene ese descuento por compromiso.

La contra que asumo es que el mantenimiento y los parches del sistema operativo quedan de mi lado. Con Fargate eso no existiría.

Las instancias corren la misma imagen Docker que uso localmente, guardada en ECR y descargada al arrancar. Eso me asegura que lo que probé en mi máquina es lo mismo que corre en producción.

### Escalado: dos formas de pico, dos mecanismos

El calendario comercial concentra buena parte de la facturación en pocas fechas, y no todas se comportan igual.

| Forma | Fechas | Comportamiento |
|-------|--------|----------------|
| Pico abrupto | Hot Sale (mayo), Cyber Monday (noviembre) | Arranca a una hora exacta y la primera hora concentra el grueso |
| Rampa | Día del Niño (agosto), Día de la Madre (octubre), Navidad (diciembre) | Sube durante dos o tres semanas y después cae de golpe |

Las rampas las cubre bien el escalado reactivo, porque el tráfico crece de a poco y hay tiempo de acompañarlo.

Los picos abruptos no. El escalado reactivo necesita varios minutos para detectar la carga, lanzar la instancia y que pase el health check. Un Hot Sale que abre a las 00:00 tiene su mayor tráfico justo en esos minutos, así que la capacidad nueva llegaría cuando la ola ya pasó.

Por eso uso los dos mecanismos. Escalado dinámico según el uso de CPU al 60% para las rampas, y escalado programado por calendario para los picos: subo el mínimo del grupo unos días antes en las fechas de regalo, y una hora antes en los eventos de descuento, para tener las instancias ya listas cuando se abra la venta. El mínimo es de 2 instancias, una por zona.

Que las fechas se sepan de antemano es la mayor ventaja que tiene este negocio. No tengo que adivinar cuándo va a llegar la carga, solo acordarme de programarla.

### RDS PostgreSQL

Elegí PostgreSQL por dos motivos. El primero es que ya lo usé y lo conozco: elegir una tecnología que sé operar reduce el riesgo, y prefiero eso antes que una que rinda mejor en el papel pero que no sepa manejar cuando algo falle. El segundo es que es la misma base que uso localmente, así que el esquema y el `SELECT ... FOR UPDATE` que protege el stock funcionan sin tocar una línea de código.

Uso RDS en vez de instalar PostgreSQL en una EC2 porque me da backups, parches y la posibilidad de failover sin que yo tenga que construir nada de eso.

### Multi-AZ solo durante las campañas

Multi-AZ mantiene una réplica sincrónica en otra zona de disponibilidad y promueve la standby automáticamente si la primaria falla. Al ser sincrónica no se pierde ninguna transacción confirmada, que es lo que me importa en el checkout: un pedido por el que ya se descontó stock no puede desaparecer.

Ahora, Multi-AZ cuesta exactamente el doble que Single-AZ, porque AWS mantiene una instancia standby completa encendida sin que reciba tráfico. **Decidí no tenerlo activo todo el año.** Lo activo únicamente durante las fechas fuertes, que son las que concentran buena parte de mi facturación y en las que una caída cuesta mucho más.

**Cómo lo automatizo.** No quiero que dependa de que me acuerde, porque si me olvido de activarlo antes del Día de la Madre quedo sin protección justo en la fecha que más me importa. Uso una regla de **EventBridge** con expresión cron que dispara una **Lambda**, y esa Lambda modifica la instancia de RDS para pasarla a Multi-AZ. Una segunda regla la vuelve a Single-AZ cuando termina la campaña.

La conversión no es instantánea, porque AWS tiene que crear la standby y sincronizarla, así que la regla se dispara **dos semanas antes** de cada fecha y no la noche anterior.

**La pieza que no puede faltar es la verificación.** Que la Lambda haya corrido no significa que la base haya quedado en Multi-AZ: pueden haber cambiado los permisos del rol, o la modificación puede haber fallado. Por eso configuro una alarma que consulta el estado real de la instancia y avisa por SNS si, llegada la fecha, no está en Multi-AZ. Sin esa verificación, la automatización solo cambia el riesgo de olvidarme por el riesgo de que falle en silencio, que es peor porque no se nota.

**Lo que resigno.** Fuera de las campañas no tengo failover automático. Si la base primaria falla un martes de marzo, hay que restaurar desde el último snapshot, y eso son horas y no minutos. Lo asumo: en esas fechas el volumen de ventas es mucho menor y prefiero destinar ese dinero a otra cosa. Las consecuencias sobre los tiempos de recuperación están detalladas en [06-disaster-recovery.md](./06-disaster-recovery.md).

**Un detalle de mantenimiento:** las fechas de Hot Sale y Cyber Monday cambian todos los años, así que las reglas del calendario hay que revisarlas anualmente. Navidad, Día del Niño y Día de la Madre sí son predecibles.

### El carrito en la base, y no en la memoria del servidor

Este fue el problema que más me costó resolver, y terminé cambiando de idea.

La primera versión de la aplicación guardaba el carrito en la memoria del proceso de Node. Con un solo contenedor anda bien, pero con varias instancias detrás de un balanceador cada pedido puede caer en una instancia distinta y el carrito aparece vacío.

La salida habitual es activar **sticky sessions** en el balanceador: una cookie manda a cada persona siempre a la misma instancia. Es gratis y se configura en un minuto. Lo descarté porque tiene un problema que en mi caso es grave: **si esa instancia se da de baja, esa persona pierde el carrito.** Y no es hipotético, porque mi Auto Scaling da de baja instancias justo cuando cae la carga después de un pico, o sea al final de una campaña, con gente todavía comprando.

También evalué **ElastiCache**, que es la respuesta clásica. Resuelve el problema, pero es un servicio más para pagar y mantener.

**Lo que elegí fue mover el carrito a PostgreSQL**, que es la base que ya tengo. Son dos tablas más (`carritos` y `carrito_items`) y el navegador guarda únicamente un token en una cookie firmada. La aplicación queda sin estado: cualquier instancia puede atender cualquier pedido.

Me convenció por tres razones:

- **No cuesta nada.** No sumo ningún servicio.
- **Es la tecnología que ya elegí** por conocerla, con el mismo modelo transaccional que ya uso.
- **Resuelve más que el problema original.** Con sticky sessions o ElastiCache el carrito sobrevive a la caída de una instancia. En la base además sobrevive a que la persona cierre el navegador y vuelva al día siguiente. Eso deja de ser un detalle técnico y pasa a ser una función de negocio: un carrito que persiste es un carrito que puedo recuperar.

**Lo probé.** El script [`app/test/carrito-persistente.js`](../app/test/carrito-persistente.js) arma un carrito, reinicia el contenedor de la aplicación —que es el equivalente local a que el Auto Scaling dé de baja esa instancia— y vuelve a consultar el carrito con la misma cookie. El resultado está en [`evidence/test-carrito-persistente.txt`](../evidence/test-carrito-persistente.txt): el carrito sigue completo.

**La contra que asumo** es que cada cambio en un carrito es una escritura en la base, y esas escrituras compiten con las del checkout. A mi volumen no es un problema, porque una persona toca su carrito unas pocas veces por visita. Si algún día lo fuera, ahí sí incorporaría ElastiCache, pero como respuesta a un problema medido y no por las dudas.

Como consecuencia, **el balanceador no necesita sticky sessions** y puede repartir la carga de manera pareja entre las instancias.

### Recomendaciones, y lo que habilita tenerlas en la base

El carrito muestra un bloque de "quienes compraron esto también llevaron". No usa ningún servicio de recomendación ni nada de aprendizaje automático: sale de cruzar la tabla `pedido_items` contra sí misma, buscando qué otros productos aparecían en los pedidos que incluían lo que hay en el carrito.

Vale la pena notar la consecuencia técnica, porque es la que me importa como arquitecta: **esa consulta se pone más cara a medida que crecen los pedidos.** Cruza una tabla contra sí misma y agrupa, y corre en cada visita al carrito. Es exactamente el tipo de lectura pesada que compite con las escrituras del checkout. Hoy, con el volumen que tengo, no es problema. Cuando lo sea, es el caso que finalmente justifica la réplica de lectura y el caché que menciono más abajo: dejarían de ser mejoras teóricas y pasarían a tener un motivo concreto.

**El paso siguiente: recomendaciones por mail con SES.** Como el carrito vive en la base y no en la memoria del servidor, puedo ver los **carritos abandonados**: los que tienen productos y no se tocan hace unos días. Una regla de EventBridge dispara diariamente una Lambda que busca esos carritos, calcula las recomendaciones con la misma consulta y envía el correo con **Amazon SES**.

Esto es lo que más me interesa de haber movido el carrito a la base, y no lo había pensado cuando tomé esa decisión. **Con el carrito en la memoria del servidor, un carrito abandonado simplemente desaparece: no queda registro de que existió.** Al estar en la base, se convierte en una oportunidad de venta recuperable. Y encaja con la razón por la que quiero dejar el marketplace: el correo es, justamente, ser dueña de la relación con el cliente.

Tiene dos condiciones previas que no puedo saltear. La primera es técnica: necesito la dirección de correo, así que depende de tener el login resuelto con Cognito. La segunda es legal: la Ley 25.326 exige consentimiento para enviar comunicaciones comerciales, así que hace falta que la persona lo haya aceptado y que cada correo incluya una forma clara de darse de baja.

### Concurrencia: qué está resuelto y qué no

El checkout corre dentro de una transacción con `SELECT ... FOR UPDATE`, que bloquea las filas de los productos hasta que la transacción termina. Lo probé: el script [`app/test/concurrencia.js`](../app/test/concurrencia.js) deja una sola unidad en stock y lanza 25 compradores simultáneos. El resultado quedó en [`evidence/test-concurrencia.txt`](../evidence/test-concurrencia.txt):

```
Compraron: 1    Rechazados: 24    stock final: 0    inconsistencias: 0
```

Sin este mecanismo, las 25 habrían leído "stock = 1" y las 25 habrían vendido.

Lo que esto no resuelve es la escala. Las 25 compras tardaron 582 ms porque se serializaron: cada una esperó a que la anterior soltara la fila. Con 25 no se nota, pero con miles de personas peleando por la oferta destacada de un Hot Sale, esa cola se convierte en el cuello de botella.

Para ese caso la salida sería desacoplar la compra usando **SQS**. En vez de que cada pedido compita por bloquear la misma fila, las confirmaciones entran a una cola y un proceso las va tomando de a una contra la base. El usuario recibe enseguida un "estamos procesando tu compra" en lugar de quedarse esperando a que se libere el bloqueo, y la base deja de recibir cientos de conexiones peleando por lo mismo. La contra es que la compra pasa a ser asincrónica: hay que avisarle después si salió bien o si se agotó, y eso cambia la experiencia. Es un rediseño y no un ajuste, así que lo dejo anotado como el camino si el volumen lo justifica.

El otro punto a vigilar son las lecturas del catálogo, porque en un pico la mayoría del tráfico es gente mirando y esas consultas compiten con las escrituras del checkout. La salida sería agregar una réplica de lectura de RDS y mandarle el catálogo, dejando la primaria dedicada a las compras.

### S3 y CloudFront

Las imágenes de producto van a S3 y se sirven a través de CloudFront. Así las instancias se dedican solo a generar el HTML y consultar la base. En un pico, la mayor parte del tráfico es de imágenes y ni siquiera toca mi infraestructura, así que escalo menos y pago menos.

CloudFront además tiene ubicaciones en todo el mundo, así que sería la pieza que haría viable vender a clientes de otros países sin rediseñar nada.

### Route 53, ACM y WAF

**Route 53** lo uso para tener mi dominio propio. Es parte del punto de todo el proyecto: dejar de vender bajo la marca de otro y que la gente entre a mi tienda.

**ACM** lo uso para darle más confianza a quien compra. Alguien que entra sus datos en mi sitio está confiando en mí, y el candado del navegador es lo primero que mira; sin eso, muchos se van antes de ver un precio. Cuando sume la pasarela de pago, ese tráfico también viaja cifrado. Y como el certificado de ACM se renueva solo, no corro el riesgo de que se venza y me deje la tienda caída, que es de los incidentes más evitables que hay.

**WAF** lo uso principalmente para protegerme de bots. En las campañas aparecen bots que se llevan las ofertas destacadas antes que las personas, y el límite de peticiones por IP los frena. De paso filtra inyección SQL y cross-site scripting contra el checkout, que es donde se escriben los pedidos y se descuenta el stock.

### ECR, Secrets Manager y CloudWatch

**ECR** lo uso para guardar mi imagen Docker. Es la pieza que sostiene lo que más me importa de este diseño: que corra la misma imagen en mi máquina y en producción. Sin un registro donde publicarla, esa garantía no existe.

**Secrets Manager** lo uso para no exponer la contraseña de la base dentro del código. La aplicación la pide al arrancar usando el rol de la instancia, así que no queda escrita en el Launch Template, ni en la AMI, ni en el repositorio.

**CloudWatch y SNS** los uso porque con Auto Scaling la instancia que generó un error puede ya no existir cuando voy a investigar: si los logs quedan en la máquina, se van con ella. Además las métricas de CloudWatch son las que disparan el escalado, y la alarma que verifica que Multi-AZ quedó activo antes de cada campaña también vive acá. Sin SNS no me llegaría ese aviso, que es justamente el que necesito recibir a tiempo.

### Las decisiones de red

**Dos zonas de disponibilidad**, para que ningún datacenter único pueda dejarme sin tienda. Cuesta prácticamente lo mismo: son las dos instancias que iba a pagar igual, solo que repartidas en vez de juntas.

**Dos NAT Gateway, uno por zona.** Con uno solo, si se cae esa zona las instancias de la otra quedan sin salida a internet, y así la redundancia del cómputo quedaría a medias. Son unos 76 dólares mensuales entre los dos, y la alternativa de dejar uno solo está evaluada en [05-costos.md](./05-costos.md) junto con el resto de las decisiones de costo.

## Flujo de un pedido

```
Usuario → Route 53 → CloudFront ─┬─▶ S3         (imágenes, CSS: caché)
                                 └─▶ WAF → ALB  (HTML dinámico)
                                            │
                                            ▼
                                     EC2 (ASG, 2 zonas)
                                            ▼
                                  RDS PostgreSQL Multi-AZ
```

El ALB consulta `/health` en cada instancia. Ese endpoint verifica que la conexión a PostgreSQL responda y devuelve 503 si no. Una instancia que perdió la base sale de rotación en vez de seguir recibiendo clientes para devolverles un error.

## Qué dejé afuera a propósito

| Servicio | Por qué |
|----------|---------|
| ElastiCache | Por costo. Queda anotado como el próximo paso. |
| Aurora Serverless | Más caro en la carga base constante que tiene esta tienda, y más difícil de estimar. |
| Réplicas de lectura | Con el volumen actual la primaria alcanza. Las agregaría si el catálogo empieza a competir con el checkout. |
| Multi-región | Por recuperación ante desastres no se justifica (ver [06](./06-disaster-recovery.md)). Por latencia internacional sí, y sería la evolución natural. |
| CloudFront sobre el HTML | El catálogo muestra stock en vivo. Cachearlo mostraría unidades ya vendidas. |
