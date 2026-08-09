# 05 --- Estimación de Componentes y Costos

La estimación corresponde a la arquitectura actual de PeluApp, orientada
a una peluquería pequeña con tráfico bajo y una cantidad moderada de
usuarios.

## Servicios principales

*ECS Fargate (Cómputo):*\
*Rol:* Ejecución de los contenedores Node.js + Express.\
*Configuración estimada:* 2 tareas, 0.25 vCPU y 0.5 GB de memoria cada
una.\
*Por qué:* Permite ejecutar la aplicación Dockerizada sin administrar
servidores. El costo depende de los recursos de CPU y memoria
utilizados.

*RDS MySQL Multi-AZ (Base de datos):*\
*Rol:* Almacenamiento de clientes, servicios, profesionales y turnos.\
*Configuración estimada:* instancia pequeña, 20 GB y despliegue
Multi-AZ.\
*Por qué:* Permite utilizar una base de datos relacional administrada
con failover automático.

*Application Load Balancer (ALB):*\
*Rol:* Distribución del tráfico hacia las tareas ECS.\
*Por qué:* Recibe las solicitudes HTTPS y las distribuye entre las
tareas disponibles. El costo depende de las horas de uso y las LCUs.

*Route 53:*\
*Rol:* Gestión DNS del dominio.\
*Por qué:* Permite dirigir el dominio de PeluApp hacia CloudFront. El
costo depende principalmente de la zona alojada y las consultas DNS.

*CloudFront:*\
*Rol:* CDN y distribución de contenido.\
*Por qué:* Permite entregar contenido mediante la red de AWS y reducir
la carga directa sobre la infraestructura.

*ECR:*\
*Rol:* Almacenamiento de la imagen Docker.\
*Por qué:* ECS obtiene desde ECR la imagen necesaria para ejecutar
PeluApp.

*ACM:*\
*Rol:* Certificado HTTPS.\
*Por qué:* Permite utilizar certificados TLS/SSL públicos sin costo
adicional.

*Secrets Manager:*\
*Rol:* Protección de credenciales.\
*Por qué:* Evita almacenar usuario y contraseña de MySQL directamente
en el código.

*CloudWatch:*\
*Rol:* Logs, métricas y alarmas.\
*Por qué:* Permite monitorear ECS, ALB y RDS. El costo depende
principalmente del volumen de logs y su retención.

*VPC Endpoints:*\
*Rol:* Permitir que las tareas ECS en subredes privadas accedan a
servicios AWS como ECR, Secrets Manager y CloudWatch Logs sin salir a
Internet mediante un NAT Gateway.\
*Por qué:* Mantienen la comunicación con estos servicios dentro de la
red de AWS. Los Interface Endpoints generan un costo por hora y por
datos procesados, por lo que representan un componente relevante del
costo total.

## Estimación mensual

  Servicio                             Configuración                              Costo aprox.
  ------------------------------------ ------------------------------ ------------------------
  ECS Fargate                          2 tareas, 0.25 vCPU / 0.5 GB                   \~US\$18
  RDS MySQL Multi-AZ                   Instancia pequeña, 20 GB                   \~US\$30--40
  ALB                                  1 ALB, tráfico bajo                        \~US\$20--25
  VPC Interface Endpoints              4 endpoints × 2 AZ                             \~US\$58
  CloudFront                           Tráfico bajo                                 \~US\$1--2
  Route 53                             1 zona alojada                               \~US\$0,50
  ECR + Secrets Manager + CloudWatch   Uso bajo                                     \~US\$2--4
  ACM                                  Certificado público                               US\$0
  *Total estimado*                                                    *\~US\$130--150/mes*

El valor es orientativo y puede variar según el consumo real de CPU,
memoria, almacenamiento, solicitudes, transferencia de datos y logs.

## VPC Endpoints y costos

Las tareas ECS se encuentran en *subredes privadas*. Para acceder a
servicios administrados de AWS sin utilizar un NAT Gateway, la
arquitectura utiliza VPC Endpoints.

Los endpoints principales son:

-   *ECR API*
-   *ECR DKR*
-   *Secrets Manager*
-   *CloudWatch Logs*
-   *S3 mediante Gateway Endpoint*, que no tiene cargo por hora.

Los Interface Endpoints tienen un costo por hora *por cada AZ* y
cargos por datos procesados. Por eso, aunque permiten mantener la
arquitectura privada y evitar un NAT Gateway, representan una parte
importante del costo mensual estimado.

## Estrategias de optimización de costos

-   *Right Sizing:* comenzar con tareas Fargate pequeñas y ajustar
    CPU/memoria según las métricas reales.
-   *RDS Multi-AZ:* mantenerlo porque forma parte de la arquitectura
    de alta disponibilidad, pero evaluar Single-AZ si el costo resulta
    demasiado alto para una primera versión.
-   *Cantidad mínima de tareas:* mantener dos tareas para aprovechar
    la disponibilidad entre Availability Zones, aumentando la capacidad
    sólo cuando sea necesario.
-   *CloudWatch:* establecer una retención limitada de logs para
    evitar almacenamiento innecesario.
-   *VPC Endpoints:* mantener únicamente los endpoints necesarios y
    revisar periódicamente el tráfico para comprobar que su costo se
    justifica.
-   *Fargate Spot:* utilizarlo en ambientes de desarrollo o pruebas
    donde las tareas puedan ser interrumpidas.

## Qué simplificaría en una primera versión

Para una peluquería pequeña, la arquitectura puede resultar más costosa
de lo estrictamente necesario debido principalmente a **RDS Multi-AZ,
dos tareas ECS y los VPC Interface Endpoints**.

La ventaja es que estos componentes dejan a PeluApp preparada para una
mayor disponibilidad y una arquitectura privada. Si el presupuesto fuera
una restricción importante, podrían reducirse algunos de estos
componentes en una primera etapa y habilitarse posteriormente.

## Herramienta recomendada

La estimación debe verificarse utilizando *AWS Pricing Calculator* con
la región us-east-1 y los recursos definidos en el diagrama actual.