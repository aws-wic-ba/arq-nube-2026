# 05 — Estimación de costos

Los números que siguen son estimaciones de orden de magnitud sobre precios on-demand de us-east-1. Sirven para dimensionar decisiones, no para presupuestar. Las tablas de servicios están en dólares porque AWS factura en esa moneda, y la conversión a pesos está más abajo. Conviene verificarlos en la [AWS Pricing Calculator](https://calculator.aws/).

Los supuestos: dos instancias t3.medium de base, una por zona, escalando hasta seis en los picos; RDS PostgreSQL db.t3.medium en Multi-AZ con 100 GB de almacenamiento; y alrededor de 100 GB salientes por mes.

## Estimación mensual

La base de datos tiene dos precios según el mes, porque **activo Multi-AZ solo durante las campañas** (el razonamiento está en [03](./03-arquitectura-aws.md)). Considerando el tiempo de sincronización previo, queda en Multi-AZ alrededor de 4 meses al año.

| Servicio | Mes normal | Mes de campaña |
|----------|-----------:|---------------:|
| RDS PostgreSQL (Single-AZ / Multi-AZ) | ~61 | ~123 |
| NAT Gateway (dos, uno por zona) | ~76 | ~76 |
| EC2 (dos t3.medium on-demand) | ~61 | ~61 |
| Application Load Balancer | ~22 | ~22 |
| CloudWatch, WAF y backups | ~30 | ~30 |
| CloudFront y S3 | ~11 | ~11 |
| ECR, Route 53 y Secrets Manager | ~3 | ~3 |
| EventBridge y Lambda (automatización) | <1 | <1 |
| **Total** | **~264** | **~326** |

La automatización que prende y apaga Multi-AZ cuesta centavos: son dos ejecuciones de Lambda por campaña y un puñado de reglas de calendario.

## El costo anual de las campañas

Las fechas fuertes no son una sino cinco, y duran distinto. Unas son picos de horas y otras rampas de semanas.

| Fecha | Instancias extra | Duración | Instancia-días |
|-------|------------------|----------|---------------:|
| Hot Sale (mayo) | +4 | 3 días | 12 |
| Día del Niño (agosto) | +2 | 10 días | 20 |
| Día de la Madre (octubre) | +2 | 10 días | 20 |
| Cyber Monday (noviembre) | +4 | 3 días | 12 |
| Navidad (diciembre) | +2 | 20 días | 40 |
| | | **Total** | **~104** |

Sumando 8 meses normales (~264), 4 meses con Multi-AZ activo (~326), el cómputo extra de los picos (~105) y el tráfico adicional (~200), el total anual queda en unos **3.713 dólares**.

Hay dos decisiones que se pagan solas en este número:

| Decisión | Alternativa | Ahorro anual |
|----------|-------------|-------------:|
| Escalado automático del cómputo | Seis instancias prendidas todo el año | ~1.135 |
| Multi-AZ solo en campañas | Multi-AZ los 12 meses | ~492 |

El escalado automático no resigna nada, porque en los picos la capacidad es exactamente la misma. El Multi-AZ por campañas sí resigna algo concreto: fuera de esas fechas no hay failover automático, y eso está asumido en [06](./06-disaster-recovery.md).

Con un Savings Plan sobre las dos instancias base el total baja a unos **3.473 dólares**.

## Conversión a pesos

Tipo de cambio utilizado: 1 USD = $1.525 ARS.

| Concepto | USD | ARS |
|----------|----:|----:|
| Factura de un mes normal | ~264 | ~$402.600 |
| Factura de un mes de campaña | ~326 | ~$497.150 |
| **Total anual** | **~3.713** | **~$5.662.300** |

A esto hay que sumarle los impuestos y percepciones que se aplican a los servicios digitales del exterior. No pongo un porcentaje porque cambian con frecuencia y quedaría desactualizado, pero corresponde dejar asentado que el costo real en pesos es mayor que la conversión directa.

Esto no es solo un tema contable. Tengo ingresos en pesos y costos en dólares, así que si el dólar sube un 30%, mi factura sube un 30% medida en pesos sin que haya cambiado nada técnico ni haber vendido más. Y como cerca del 80% del costo es fijo, un mes de ventas flojas combinado con un dólar en alza es el peor escenario posible.

## Los tres servicios más caros

**RDS Multi-AZ, unos 123 dólares al mes.** Es el ítem más caro y es una decisión deliberada. Multi-AZ cuesta el doble que Single-AZ porque AWS mantiene una instancia standby completa en otra zona. Con Single-AZ ahorraría unos 60 dólares mensuales, pero una falla de zona significaría restaurar desde backup, o sea horas con la tienda cerrada. Sesenta dólares por mes es menos de lo que cuesta una hora caída en campaña.

**NAT Gateway, unos 76 dólares al mes entre los dos.** Es el gasto que más me molesta, porque es infraestructura de red que no aporta nada visible al cliente y se cobra por hora encendido más por datos procesados. En una primera versión dejaría uno solo y ahorraría unos 38. La contra es que si se cae esa zona, las instancias de la otra quedan sin salida a internet, pero no la necesitan para atender clientes: solo para bajar la imagen y actualizaciones.

**EC2, unos 61 dólares al mes.** Es el más fácil de optimizar. Un Savings Plan a un año sobre las dos instancias base ahorra alrededor de 20 dólares mensuales, y tiene sentido porque esas dos van a estar prendidas todo el año de cualquier manera.

## El punto de equilibrio contra el marketplace

En el marketplace pago comisión por venta; con tienda propia pago infraestructura fija. Son estructuras opuestas: si vendo poco la comisión es baja pero la infraestructura se paga igual, y si vendo mucho la comisión sube mientras la infraestructura casi no se mueve.

Por experiencia propia vendiendo en MercadoLibre, la comisión va del 11% al 17,5% según la categoría del producto. Con la infraestructura en unos $5.662.300 anuales:

| Comisión | Facturación anual de equilibrio |
|----------|--------------------------------:|
| 17,5% | ~$32.400.000 |
| 14% | ~$40.400.000 |
| 11% | ~$51.500.000 |

O sea que la tienda propia empieza a convenir a partir de una facturación de entre 32 y 52 millones de pesos anuales, según en qué categoría venda. Por debajo de eso, la comisión sale más barata que sostener la infraestructura. Y una vez pasado ese umbral la ventaja crece sola, porque duplicar las ventas duplica la comisión pero deja la factura de AWS casi igual.

Lo que me interesa de este cálculo no es decidir hoy si migro, sino tener identificado el umbral. Convierte una decisión difusa en una condición que puedo verificar.

**Lo que esta comparación no incluye.** Sería deshonesto presentarla como una ganancia limpia. La comisión del marketplace no paga solo el procesamiento del pago: también trae el tráfico, porque nadie busca mi tienda sino que la gente busca en MercadoLibre, y aporta la confianza de una marca conocida. Con sitio propio, conseguir visitas pasa a ser un costo nuevo que no está en ninguna tabla de este documento y que puede ser mayor que la factura de AWS. Así que el punto de equilibrio calculado es el piso, no el número final. Lo que sí gano y no aparece en la cuenta es el control sobre la entrega y la relación con el cliente, que es la razón principal por la que me interesa ([01](./01-descripcion.md)).

## Qué simplificaría en una primera versión

| Cambio | Ahorro USD/mes | Qué resigno |
|--------|---------------:|-------------|
| RDS Single-AZ | ~60 | Failover automático. Volvería a Multi-AZ antes de la primera campaña. |
| Un solo NAT Gateway | ~38 | Salida a internet si cae esa zona. Riesgo acotado. |
| t3.small en vez de t3.medium | ~30 | Margen de CPU. Habría que medir la carga real primero. |
| Sacar WAF | ~10 | No lo haría. Es barato para el riesgo que cubre en una tienda. |

Con esos recortes la factura base bajaría a unos 200 dólares por mes. Es un escenario de arranque y no el objetivo: la arquitectura que propongo es la de la tabla principal, porque el requisito es aguantar las campañas.
