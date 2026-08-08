# 03 - Propuesta de arquitectura en AWS

## Descripción general

La versión actual de ZeroToTech es un MVP que corre como una SPA estática, sin backend ni base de datos: el progreso se guarda en LocalStorage y no requiere registro.

Sin embargo, el proyecto tiene una evolución prevista concreta: cuentas de usuario, progreso sincronizado entre dispositivos, contenido dinámico (empresas, eventos, comunidades) y funcionalidades como mentorías y recomendaciones personalizadas.

Por eso, la propuesta de infraestructura en AWS no está pensada solo para replicar el MVP de hoy, sino para soportar directamente ese siguiente paso, evitando tener que rediseñar la arquitectura más adelante. Se eligió un modelo 100% serverless, que permite escalar automáticamente, pagar solo por el uso real y delegar en AWS la gestión de servidores, parches y balanceo de carga.

## Diagrama de arquitectura

                       Usuario
                   ┌──────┴──────┐
                   ▼             ▼
            Amazon CloudFront   Amazon Cognito
                   │             │ (token JWT)
                   ▼             ▼
              Amazon S3     Amazon API Gateway
            (frontend         (valida token,
             estático)         enruta requests)
                                  │
                                  ▼
                            AWS Lambda
                        (lógica de negocio)
                                  │
                                  ▼
                          Amazon DynamoDB
                     (usuarios y progreso)

      AWS Lambda y API Gateway envían logs y métricas
      a Amazon CloudWatch en paralelo, para monitoreo.

Ver imagen completa en diagrams/arquitectura-aws.png

## Servicios elegidos y justificación

## Amazon S3

Almacena los archivos estáticos generados por el build de React + Vite (HTML, JS, CSS). No requiere servidor: S3 sirve el contenido directamente como sitio web estático, lo que elimina el costo y la gestión de una instancia corriendo Nginx 24/7 solo para servir archivos que no cambian entre despliegues.

## Amazon CloudFront

Actúa como CDN delante de S3: distribuye el frontend desde ubicaciones de borde cercanas a cada usuario, reduce la latencia de carga y agrega HTTPS de forma nativa. Reemplaza la necesidad de un Load Balancer, ya que no hay instancias que balancear.

## Amazon Cognito

Gestiona el registro, login y la emisión de tokens (JWT) de los usuarios. Es el servicio que habilita la evolución prevista del proyecto: sin autenticación no hay forma de sincronizar progreso entre dispositivos ni de tener cuentas de usuario. Se eligió Cognito en lugar de manejar autenticación propia porque delega en AWS aspectos sensibles (hashing de contraseñas, recuperación de cuenta, tokens) que de otro modo habría que implementar y mantener manualmente.

## Amazon API Gateway

Es el punto de entrada único para todas las peticiones al backend. Valida el token emitido por Cognito antes de dejar pasar cualquier request, y enruta cada petición hacia la función Lambda correspondiente. Evita exponer las funciones Lambda directamente a internet.

## AWS Lambda

Ejecuta la lógica de negocio bajo demanda: evaluar el test de orientación, calcular el roadmap personalizado, actualizar el progreso y el sistema de XP/niveles. Se eligió sobre un servidor tradicional (EC2) porque la app tiene tráfico bajo e irregular (uso educativo), y con Lambda no se paga nada cuando nadie está usando la app — a diferencia de una instancia EC2, que factura aunque esté inactiva.

## Amazon DynamoDB

Base de datos NoSQL donde se guardan los perfiles de usuario y el progreso de aprendizaje. Se eligió NoSQL en lugar de una base relacional (RDS) porque los datos de ZeroToTech (perfil tecnológico, XP, roadmap, respuestas del test) no requieren relaciones complejas ni transacciones entre tablas, y DynamoDB escala automáticamente sin necesidad de dimensionar ni administrar un motor de base de datos.

## Amazon CloudWatch

Centraliza los logs de ejecución de las funciones Lambda y las métricas de API Gateway (errores, latencia, cantidad de invocaciones). Permite detectar fallas y monitorear el estado general del sistema sin tener que acceder manualmente a cada componente.

## Por qué no EC2 + RDS

Se consideró una alternativa más tradicional (EC2 + RDS PostgreSQL, similar al entorno local con Docker), pero se descartó por dos motivos:

Costo ocioso: una instancia EC2 corre y se factura 24/7, incluso sin usuarios activos. Para una app con tráfico bajo e impredecible como ZeroToTech, eso es gasto innecesario.

Gestión operativa: EC2 y RDS requieren patching del sistema operativo, gestión de backups y configuración de escalado manual (Auto Scaling Groups, Load Balancer). El modelo serverless delega toda esa responsabilidad en AWS, lo que tiene más sentido para un equipo de una sola persona manteniendo el proyecto.

RDS quedaría como alternativa válida únicamente si en el futuro la app necesitara relaciones complejas entre entidades (por ejemplo, un sistema de mentorías con matching entre mentores y mentees, con múltiples tablas relacionadas) — algo a evaluar en una fase posterior del proyecto.
