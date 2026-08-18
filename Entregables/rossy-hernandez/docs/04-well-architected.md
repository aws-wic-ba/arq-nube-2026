# 04 — AWS Well-Architected Framework

## Excelencia Operativa

**Decisiones tomadas:**
- Arquitectura serverless-first (Lambda + API Gateway + DynamoDB): no
  hay servidores que parchear, monitorear ni escalar manualmente.
- Separación de responsabilidades entre frontend, API y lógica de
  negocio, facilitando cambios independientes en cada capa.

**Qué mejoraríamos:** logs estructurados y alarmas en Amazon
CloudWatch para la Lambda, dashboards de monitoreo, y un pipeline de
CI/CD (por ejemplo con GitHub Actions) para automatizar el despliegue
del código de la Lambda y del frontend.

## Seguridad

**Decisiones tomadas:**
- La Lambda se autentica contra DynamoDB mediante un **rol de IAM**
  (principio de menor privilegio), sin credenciales expuestas en el
  código.
- CORS configurado explícitamente en API Gateway, en vez de dejarlo
  abierto por defecto.
- El campo `es_anonimo` permite a cada donante decidir si su
  información se muestra públicamente, sin perder el registro interno
  necesario para fines contables.

**Qué mejoraríamos:** agregar Amazon Cognito para autenticar a los
donantes antes de permitir el registro, AWS WAF frente a API Gateway
contra ataques comunes, y cifrado explícito con AWS KMS para los datos
sensibles (identificación, correo) en DynamoDB.

## Fiabilidad

**Decisiones tomadas:**
- DynamoDB en modo *On-Demand*: escala automáticamente ante picos de
  tráfico sin intervención manual.
- Generación de `Donante_id` con `uuid4()`, evitando condiciones de
  carrera si dos donaciones llegan al mismo tiempo.
- Diseño de `partition key` + `sort key` (`Donante_id` +
  `fecha_donacion`) que evita que registros distintos se sobrescriban
  entre sí.

**Qué mejoraríamos:** validación más estricta de los datos de entrada
en la Lambda (manejo de errores por campos faltantes o mal formados) y
reintentos automáticos del lado del frontend ante fallos de red.

## Eficiencia de Rendimiento

**Decisiones tomadas:**
- Lambda escala automáticamente creando ejecuciones en paralelo según
  la demanda, sin overhead de administración.
- DynamoDB On-Demand ajusta su capacidad de lectura/escritura de forma
  transparente.

**Qué mejoraríamos:** agregar un índice secundario global (GSI) en
DynamoDB si en el futuro se necesitan consultas por correo o por tipo
de donante, sin depender solo del `Donante_id`.

## Optimización de Costos

**Decisiones tomadas:**
- Arquitectura 100% serverless: no hay instancias ociosas, se paga
  solo por invocaciones de Lambda y operaciones reales de DynamoDB.
- DynamoDB On-Demand en lugar de capacidad reservada, ideal para el
  tráfico bajo e irregular de una fundación pequeña.
- Sin NAT Gateway, ALB ni RDS: se evitan los costos fijos mensuales
  característicos de arquitecturas basadas en servidores.

**Qué mejoraríamos:** monitorear el uso real con AWS Cost Explorer una
vez en producción, y evaluar Reserved Capacity en DynamoDB solo si el
volumen de donaciones creciera de forma sostenida y predecible.

## Sostenibilidad

**Decisiones tomadas:**
- Región `us-east-1`, una de las regiones de AWS con mayor porcentaje
  de energía renovable.
- Al ser serverless, no hay servidores encendidos sin uso: los
  recursos de cómputo solo se activan durante la ejecución real de la
  Lambda.

**Qué mejoraríamos:** activar el AWS Customer Carbon Footprint Tool
para medir y reportar la huella de carbono del sistema una vez en
producción.
