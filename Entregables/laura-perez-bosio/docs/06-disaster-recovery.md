# 06 — Pensamiento arquitectónico y plan de recuperación ante desastres

## Usuarios y disponibilidad

| Usuario | Qué hace | Si la app está caída |
|---------|----------|----------------------|
| Clientes (público general) | Navegan, arman el carrito y compran | Se van a la competencia. La venta no se pospone, se pierde. |
| Equipo interno | Carga productos, ajusta precios y stock | Trabajan más tarde. El impacto es una molestia. |

Esta diferencia ordena todo el plan. Una intranet caída significa gente esperando; una tienda caída significa plata que no vuelve. Alguien que quiere comprar un monitor y encuentra la página caída no vuelve a las dos horas: compra en otro lado. Por eso todo lo que sigue prioriza el flujo de compra por encima del panel interno.

### Horarios

| Franja | Tráfico | ¿Se puede intervenir? |
|--------|---------|----------------------|
| 20:00 a 23:00 y fines de semana | Pico | No |
| 09:00 a 18:00 días hábiles | Medio | Solo cambios de bajo riesgo |
| 03:00 a 06:00 | Mínimo | Sí |
| Semanas de campaña | Extremo | No, se congelan los cambios |

La ventana de mantenimiento queda definida los martes de 04:00 a 06:00. Martes y no lunes, porque un problema el lunes arrastra el arranque de la semana, y tampoco viernes, porque nadie quiere estar arreglando algo un sábado.

Durante las semanas de campaña no se despliega nada que no sea la corrección de un error crítico. La mayoría de los incidentes graves no vienen de que la infraestructura falle sola, sino de un cambio que se metió en el peor momento.

### Cuánto cuesta una hora caída

El impacto no es solo la venta de ese momento. También se pierden los carritos que ya estaban a un paso de cerrarse, y una tienda caída en pleno Hot Sale se comenta durante bastante más tiempo del que dura la caída.

```
Costo de una hora caída = pedidos por hora en pico × ticket promedio
```

Como supuestos de trabajo, y aclarando que son estimaciones y no datos históricos, tomo un ticket promedio de $80.000 y 15 pedidos por hora en horario pico. Eso da una hora caída costando alrededor de $1.200.000.

| Concepto | ARS |
|---|---:|
| Una hora caída en horario pico | ~$1.200.000 |
| Sobrecosto anual de Multi-AZ, activándolo solo en campañas | ~$375.000 |
| Sobrecosto anual de Multi-AZ, si lo dejara todo el año | ~$1.098.000 |

Con cualquiera de las dos opciones, el gasto anual es menor que una sola hora de caída evitada en horario pico. Elegí activarlo solo en campañas porque fuera de esas fechas el volumen es mucho menor y el mismo razonamiento deja de cerrar: una hora caída un martes de marzo no cuesta $1.200.000.

Es el mismo criterio que aplico al cómputo con el Auto Scaling: pagar la capacidad cara únicamente cuando el negocio la justifica.

En una fecha fuerte el cálculo se inclina más todavía. Como esas fechas concentran buena parte de la facturación anual, una caída ahí no cuesta una hora sino que puede costar la fecha entera.

## Marco regulatorio

| Norma | Qué exige | Consecuencia técnica |
|-------|-----------|----------------------|
| Ley 25.326, protección de datos personales | Consentimiento, medidas de seguridad y derecho a pedir la eliminación de los datos | Los backups también contienen datos personales, así que van cifrados y con retención limitada. Guardarlos para siempre no es prolijidad, es exposición. |
| PCI-DSS, datos de pago | Estándar exigente si se almacenan tarjetas | Decidí no almacenar nunca datos de tarjeta. El pago se delega a una pasarela y en mi base solo queda un identificador de la transacción. La forma más efectiva de cumplir es no tener el dato. |
| Ley 24.240, defensa del consumidor | Informar precio y stock con precisión | Mostrar stock desactualizado no es solo una mala experiencia, es un problema legal. Por eso no cacheo el HTML del catálogo. |
| Conservación de comprobantes | Guardar los registros de venta varios años | Separo el backup operativo del archivo fiscal en S3 Glacier, porque son necesidades distintas y mezclarlas sale caro. |

Si más adelante se concreta la venta a otros países, habría que revisar qué normativa aplica en cada destino, porque puede exigir que los datos de esos clientes se guarden en determinada región. Eso obligaría a tener infraestructura allá por motivos legales y no de rendimiento, y conviene saberlo antes de la primera venta: mover datos de región después es mucho más caro que ubicarlos bien de entrada.

## Riesgos identificados

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|--------------|---------|------------|
| R1 | Error humano: un `DELETE` sin `WHERE`, una migración mal hecha | Alta | Muy alto | Point-in-Time Recovery, congelamiento en campañas, revisión de cambios |
| R2 | Pico de tráfico que supera la capacidad | Alta | Alto | Auto Scaling y escalado programado |
| R3 | Falla de una instancia EC2 | Media | Bajo | El Auto Scaling la reemplaza |
| R4 | Falla de la base primaria | Baja | Muy alto | RDS Multi-AZ con failover automático |
| R5 | Caída de una zona de disponibilidad | Baja | Alto | Todo desplegado en dos zonas |
| R6 | Venta de stock inexistente por concurrencia | Media | Alto | Transacción con `SELECT ... FOR UPDATE`, comprobado con 25 compradores simultáneos |
| R7 | Ataque: inyección SQL, denegación de servicio, bots | Media | Alto | WAF, límite de peticiones, CloudFront |
| R8 | Pérdida del carrito al dar de baja una instancia | Media | Medio | **Eliminado**: el carrito vive en la base, no en la memoria del servidor. Comprobado reiniciando el contenedor |
| R9 | Caída de una región completa | Muy baja | Crítico | Riesgo aceptado, ver abajo |
| R10 | Filtración de credenciales | Baja | Muy alto | Secrets Manager, roles de IAM, nada en el repositorio |

El **R8** era, en la primera versión de este diseño, un riesgo aceptado. El carrito vivía en la memoria del servidor y se resolvía con sticky sessions en el balanceador, así que al dar de baja una instancia esa persona perdía el carrito. Lo cambié: **moví el carrito a PostgreSQL** y ahora el navegador solo guarda un token en una cookie. El riesgo dejó de existir, y lo verifiqué reiniciando el contenedor de la aplicación y comprobando que el carrito sigue completo ([evidencia](../evidence/test-carrito-persistente.txt)).

El **R9**, en cambio, sí lo acepto. Es la caída de una región entera. No mantengo infraestructura en una segunda región porque multiplicaría la factura para cubrir un evento muy poco frecuente. Lo que sí hago es replicar los backups a otra región, de manera que en el peor caso los datos existan.

Y hay un tercer riesgo que asumo y que no estaba en la primera versión: **fuera de las campañas no tengo failover automático de base de datos**, porque Multi-AZ está desactivado. Una falla de la primaria en esos meses obliga a restaurar desde snapshot, con las consecuencias que detallo en la tabla de RTO.

Distinguir un riesgo mitigado de uno aceptado es más honesto que decir que la arquitectura cubre todo.

## RTO y RPO

No tiene sentido declarar un único RTO para toda la aplicación, porque recuperarse de una instancia caída y de un borrado accidental son problemas de naturaleza distinta.

Y como **Multi-AZ solo está activo durante las campañas**, los objetivos de la base son distintos según el momento del año. Prefiero declararlo así antes que publicar un número único que no podría cumplir la mitad del tiempo.

| Escenario | RTO | RPO | Cómo se recupera |
|-----------|----:|----:|------------------|
| Falla de una instancia EC2 | 5 min | 0 | El Auto Scaling la reemplaza |
| **Falla de la base primaria, en campaña** | **5 min** | **0** | Failover automático a la standby |
| **Falla de la base primaria, fuera de campaña** | **3 h** | **5 min** | Restauración desde snapshot y Point-in-Time Recovery |
| Caída de una zona, en campaña | 10 min | 0 | La otra zona absorbe el tráfico |
| Despliegue defectuoso | 15 min | 0 | Vuelvo a la imagen anterior |
| Corrupción lógica de datos | 2 h | 5 min | Point-in-Time Recovery |
| Caída de una región completa | 24 h | 24 h | Reconstrucción desde los backups replicados |

Durante las campañas el RPO de la base es cero, porque la réplica de Multi-AZ es sincrónica: una transacción se confirma recién cuando quedó escrita en las dos zonas. Eso importa sobre todo en el checkout, porque un failover no puede dejar el stock descontado sin el pedido correspondiente.

Fuera de las campañas el RPO pasa a 5 minutos, que es la granularidad del Point-in-Time Recovery, y el RTO salta de 5 minutos a unas 3 horas. **Es el precio concreto de no pagar Multi-AZ todo el año.** Lo considero aceptable porque en esos meses el volumen de ventas es mucho menor, pero si las ventas fuera de campaña crecieran, esta es la primera decisión que revisaría.

El carrito no se ve afectado por ninguno de estos escenarios de cómputo: vive en la base y no en la memoria del servidor, así que sobrevive a que se dé de baja cualquier instancia de aplicación.

### El escenario que Multi-AZ no cubre

Multi-AZ protege contra fallas de infraestructura, pero no contra errores lógicos.

Si alguien ejecuta un `DELETE` sin `WHERE` sobre la tabla de productos, esa sentencia se replica a la standby en el mismo instante. La copia no me salva: ahora tengo el desastre duplicado y perfectamente sincronizado en dos zonas.

Para eso está el Point-in-Time Recovery, que permite restaurar la base al estado que tenía en un momento anterior, con una granularidad de unos 5 minutos. Es la única defensa real contra el error humano, que además es el riesgo más probable de toda la tabla.

Por eso el RTO de ese escenario es de 2 horas y no de 5 minutos. La restauración no es automática: hay que detectar el problema, decidir a qué momento volver, restaurar sobre una instancia nueva, verificar los datos y recién ahí redirigir la aplicación. Poner 15 minutos ahí sería declarar un objetivo que no podría cumplir.

## Estrategia de recuperación

Uso dos estrategias distintas según el alcance de la falla, porque el costo de cada una es muy diferente.

| Alcance | Estrategia | Por qué |
|---------|-----------|---------|
| Dentro de la región, **en campaña** | Warm Standby | Dos zonas de cómputo activas y una standby de RDS lista para promoverse. Recuperación en minutos y automática. |
| Dentro de la región, **fuera de campaña** | Backup & Restore para la base | El cómputo sigue repartido en dos zonas, pero la base es Single-AZ y una falla obliga a restaurar. Horas y manual. |
| Región completa | Backup & Restore | Backups replicados a otra región, sin infraestructura encendida. Recuperación en horas y manual. |

Que la estrategia cambie según la época del año es deliberado. La disponibilidad no es un valor absoluto que se compra de una vez: es un gasto que se justifica contra lo que cuesta estar caída, y en mi negocio eso varía muchísimo entre un martes de marzo y el fin de semana previo al Día de la Madre.

No elegí Multi-Site para el caso regional porque implicaría duplicar la infraestructura completa, más o menos el doble de la factura, para cubrir un evento que casi con seguridad nunca va a ocurrir. Pilot Light sería más barato pero igual exigiría mantener una base replicada entre regiones y el trabajo permanente de que las dos configuraciones no se desfasen.

Para esta tienda, 24 horas de RTO ante la pérdida total de una región es aceptable. Es un escenario en el que probablemente medio internet esté caído también. Lo que no sería aceptable es perder los datos, y eso está cubierto.

Vale una aclaración: multi-región no se justifica como estrategia de recuperación, pero sí se justificaría por latencia si prospera la venta a otros países. Ahí dejaría de ser un seguro contra catástrofes y pasaría a ser una mejora que se usa todos los días, resolviendo el escenario de desastre como efecto secundario. La decisión correcta depende de qué esté pagando la inversión.

## Plan de backups

| Qué | Método | Frecuencia | Retención |
|-----|--------|-----------|-----------|
| Base de datos | Snapshot automático de RDS | Diario, a las 04:00 | 30 días |
| Base de datos | Registro de transacciones para Point-in-Time Recovery | Continuo | 7 días |
| Base de datos | Snapshot manual replicado a otra región | Antes de cada campaña y de cada migración | 90 días |
| Imágenes de producto | Versionado de S3 y replicación entre regiones | Continuo | 90 días |
| Imagen de la app | Versiones en ECR | En cada despliegue | Últimas 10 |
| Comprobantes fiscales | Exportación a S3 Glacier | Mensual | Según normativa |

Todos los backups van cifrados. Un snapshot es una copia completa de la base, así que si se filtra, se filtró todo.

Antes de cada campaña se toma un snapshot manual. Es el momento de mayor volumen de transacciones y de mayor costo de una pérdida, así que quiero tener un punto de restauración conocido justo antes de entrar.

## Lo que falta

Este plan no fue probado. Está diseñado, pero un plan de recuperación que nunca se ejecutó es una hipótesis. Las tres pruebas que haría, en orden de prioridad:

1. Forzar un failover de RDS desde la consola y medir cuánto tarda de verdad, y cómo reacciona la aplicación mientras cambia el endpoint. Es la más importante porque es el escenario de mayor impacto.
2. Restaurar un Point-in-Time Recovery completo en un entorno aparte y cronometrarlo. Mi RTO de 2 horas es una estimación, y hasta no medirlo no sé si son 2 o 5.
3. Dar de baja una instancia a propósito en horario de bajo tráfico y verificar que el Auto Scaling la reemplaza y que el balanceador la saca de rotación antes de que algún cliente vea un error.

Sin estas pruebas, los números de la tabla de RTO son objetivos y no garantías. Me parece más útil dejarlo dicho que presentar un plan que aparente más certeza de la que tiene.
