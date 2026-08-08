# 03 - Arquitectura en AWS

## Servicios de AWS elegidos

| Componente | Servicio AWS |
|---|---|
| DNS | **Amazon Route 53** |
| Hosting del frontend | **Amazon S3 + Amazon CloudFront** |
| Backend | **App Load Bolancer (ALB)** para balancear el **Amazon ECS con Fargate** |
| Base de datos | **Amazon RDS Serverless (Aurora Serverless)** compatible con PostgreSQL |
| Autenticación | **Amazon Cognito** |
| Recordatorios / notificaciones | **Amazon EventBridge Scheduler + Amazon SNS** |
| Monitoreo y logs | **Amazon CloudWatch** |
| Red | **Amazon VPC** (subredes públicas y privadas) + **NAT Gateway** |

## Justificación de cada servicio

**Route 53:** Maneja el dominio de la app y las resoluciones DNS hacia CloudFront (frontend) y hacia el ALB (API).

**Amazon S3 + CloudFront:** El frontend es una app React que compila a archivos estáticos. Los archivos no cambian por request, S3 los guarda de forma durable y económica (ventaja frente al costo de pagar un servidor 24/7). CloudFront acerca el contenido a las ubicaciones de los usuarios, lo que mejora la velocidad de carga y además reduce la carga directa sobre S3. Si bien la app esta pensada para Argentina/LATAM (por el tipo de estudios o recomendaciones médicas de cada región), posibilita que personas viviendo fuera de la región y/o que esten de viaje, el acceso ágil a su información. Posibilidad de expansión.

**ECS-Fargate + Load Balancer:** Fargate me permite reutilizar la imagen de conteiner del backend, utilizado en entorno local, y es serverless. No elegí EC2 porque no quiero administrar servidores ni parches de sistema operativo. El ALB permite correr tareas (réplicas) en paralelo, y los health checks son propios del balanceador, logrando la tolerancia a fallos; desviando el tráfico y/o de ser necesario ECS levantando una nueva de forma automática.

**RDS Serverless-Aurora Serverless v2:** Se espera que el tráfico sea irregular (usuarios cargando controles esporádicamente), por lo que una base que escala su capacidad sola según la demanda es más costo-efectiva que una instancia fija. Además, al ser compatible con PostgreSQL, el modelo relacional (usuarios, controles, historial) se mapea sin conversiones o pasos extras.

**Amazon Cognito:** La app permite registro con cuentas federadas (ampliamente utilizado Google/Facebook) además de registro propio. Cognito resuelve ambos casos con un servicio administrado, evita implementaciones y la necesidad de almacenar contraseñas -ayuda a evitar brechas de seguridad por errorres involuntarios durante el desarrollo y la implementación-.

**EventBridge Scheduler + SNS:** El corazón, el para qué, de la app es el recordatorio. Cuando el usuario carga la fecha de un control, "programa" un aviso a futuro (ej. 6 meses, 1 o 2 años, etc). EventBridge Scheduler con una revisión diaria que consulta la base y dispara recordatorio de los "vencidos", sin tener que mantener un proceso corriendo todo el tiempo. Cuando se dispara el evento, se publica un mensaje en SNS, que notificar al usuario.

**CloudWatch:** Centraliza logs y métricas (uso de CPU/memoria de Fargate, errores del ALB), y permite configurar alarmas ante comportamientos anómalos o errores, sin tener que sumar una herramienta extra.

**Amazon VPC:** La base de datos se ubica en subred privada, sin acceso directo desde internet. Solo el backend (ECS, dentro de la misma VPC) puede conectarse a ella. El ALB y el frontend (CloudFront+S3) si estarían en subred pública, los usuarios solo 'visualizan' de los objetos -interface que ven en web-.

**Infaltable! NAT Gateway :D**: En primer instancia no lo tuve en cuenta, pero claramente es necesario para la seguridad y funcionamiento de la app. Puntualmente Fargate esta en subred privada y necesita salida a internet para conexiones salientes (ej, llamar a otros servicios de AWS como Cognito o SNS y/o futuras integraciones externar). El NAT permite resolver esto, sin exponer a conexiones desde internet (hacia Fargate).


## Flujo de trabajo, dinámica de la app
El usuario accede (usando DNS provisto, thanks Route53 <3 ) al frontend estático (alojado en S3), se autentica con Cognito, y desde ahí consume la API en Fargate, que guarda y consulta los datos en RDS Serverless dentro de una VPC privada. Cuando el usuario carga la fecha de un control, se calcula la fecha que debe repetirlo. Con EventBridge se revisa diariamente la DB (por ejemplo 8am), y se dispara una notificación vía SNS cuando hay fechas 'vencidas' en los registros de los usuarios. Todo queda monitoreado centralmente en CloudWatch.


## Diagrama de arquitectura se encuentra en diagrams/arquitectura-aws.png
Usé https://cloudairy.com/app en base a los requisitos de mi app y customizado lo mejor posible para explicar la arquitectura de la misma con Canva.




