# 03 — Arquitectura propuesta en AWS

## Objetivo de la arquitectura

La arquitectura en AWS busca que CloudDesk pueda ser utilizada por estudiantes, compañeros de trabajo y equipos de proyectos sin depender de una sola computadora.

Mi objetivo es que los archivos se conserven de forma segura, que puedan recuperarse si alguien los elimina por error y que la aplicación pueda seguir funcionando aunque falle uno de sus componentes.

La región principal elegida es `us-east-1`. La aplicación se distribuiría entre dos zonas de disponibilidad para evitar que toda la solución dependa de una única zona.

El diagrama completo se encuentra en:

```text
diagrams/arquitectura-aws.png

## Servicios seleccionados

### Amazon ECS con Fargate

Elegí Amazon ECS con Fargate para ejecutar el contenedor de CloudDesk.

Durante el curso también vimos EC2 y Elastic Beanstalk, pero para este proyecto prefiero Fargate porque permite ejecutar contenedores sin tener que administrar servidores ni la infraestructura subyacente.

Esto me permitiría concentrarme más en la aplicación, simplificar el despliegue y aumentar la cantidad de tareas si creciera el número de usuarios.

La imagen Docker se guardaría en Amazon ECR.

### Amazon S3

Elegí Amazon S3 para almacenar los archivos que suben los usuarios.

Esta decisión está relacionada con mi experiencia personal: perdí los documentos que tenía en el Drive de mi cuenta universitaria cuando perdí el acceso a esa cuenta. Por eso considero importante que CloudDesk cuente con una estrategia de almacenamiento y recuperación.

S3 permite:

- Guardar archivos como objetos.
- Activar versionado.
- Recuperar versiones anteriores.
- Cifrar los documentos.
- Aplicar reglas para mover archivos antiguos a clases de almacenamiento más económicas.
- Evitar que los archivos se guarden dentro de la base de datos.

El bucket sería privado y tendría bloqueado el acceso público. La aplicación utilizaría permisos de IAM para acceder únicamente a los archivos necesarios.

### Amazon RDS for PostgreSQL

Elegí PostgreSQL en Amazon RDS para almacenar los metadatos de los documentos, como:

- Nombre del archivo.
- Categoría.
- Descripción.
- Persona responsable.
- Fecha de creación.
- Ubicación del objeto en S3.

Ya tengo experiencia utilizando PostgreSQL en otros proyectos y me resulta una opción confiable para trabajar con datos relacionales.

RDS también facilita la administración porque AWS puede encargarse de tareas como backups, actualizaciones, monitoreo y recuperación de la base de datos.

Para producción utilizaría una configuración Multi-AZ. Esto mantiene una instancia secundaria en otra zona de disponibilidad y permite realizar un failover si la instancia principal tiene un problema.

### Application Load Balancer

Utilizaría un Application Load Balancer para recibir las conexiones HTTPS y distribuirlas entre las tareas de ECS Fargate.

También realizaría healthchecks para evitar enviar solicitudes a un contenedor que no esté funcionando correctamente.

### Amazon Cognito

Utilizaría Amazon Cognito para registrar y autenticar a los usuarios.

Esto permitiría que cada estudiante o integrante de un proyecto tenga su propia cuenta sin que CloudDesk tenga que almacenar directamente las contraseñas.

En una futura versión se podrían crear grupos y permisos para determinar quién puede ver, cargar o eliminar cada documento.

### Amazon CloudFront

CloudFront podría utilizarse para entregar los archivos de S3 de forma más rápida y controlada.

Para una primera versión con pocos usuarios no sería el servicio más importante. Lo incorporaría cuando la aplicación tuviera usuarios en diferentes ubicaciones o una mayor cantidad de descargas.

### AWS WAF

AWS WAF se ubicaría delante de la aplicación para bloquear solicitudes maliciosas y patrones comunes de ataques web.

En un MVP de bajo presupuesto podría empezar con reglas básicas y ampliar la protección a medida que creciera el proyecto.

### Amazon CloudWatch

Utilizaría CloudWatch para almacenar logs y monitorear:

- Errores de la aplicación.
- Respuestas HTTP 5xx.
- Uso de CPU y memoria.
- Estado de las tareas de ECS.
- Conexiones y espacio disponible en RDS.
- Fallas en los backups.

También configuraría alarmas para recibir avisos cuando un componente presente problemas.

### AWS Secrets Manager y AWS KMS

La contraseña de PostgreSQL y otros secretos no se guardarían en el código ni dentro de la imagen Docker.

Secrets Manager permitiría almacenar y rotar esas credenciales. AWS KMS se utilizaría para administrar las claves de cifrado de S3, RDS y los backups.

## Red

La infraestructura se ubicaría dentro de una VPC distribuida entre dos zonas de disponibilidad.

- El Application Load Balancer estaría en subredes públicas.
- Las tareas ECS Fargate estarían en subredes privadas.
- Amazon RDS estaría en subredes privadas y sin acceso público.
- El puerto 8000 de ECS solamente aceptaría conexiones provenientes del Load Balancer.
- El puerto 5432 de RDS solamente aceptaría conexiones provenientes de ECS.
- S3 tendría el acceso público bloqueado.

De esta manera, los usuarios no podrían conectarse directamente con los contenedores ni con la base de datos.

## Flujo de una solicitud

```text
Usuario
   │
   ▼
Route 53
   │
   ▼
CloudFront y AWS WAF
   │
   ▼
Application Load Balancer
   │
   ▼
ECS Fargate
   ├────────► Amazon RDS PostgreSQL
   │          Metadatos
   │
   └────────► Amazon S3
              Archivos
```

Amazon Cognito autenticaría al usuario antes de permitirle acceder a sus documentos.

CloudWatch recibiría los logs y métricas, mientras que Secrets Manager y KMS protegerían las credenciales y el cifrado.

## Decisión entre disponibilidad y costos

Mi prioridad sería mantener disponible la aplicación porque una caída afecta la experiencia y la confianza de los usuarios.

Sin embargo, también tendría en cuenta el presupuesto. Para una primera versión universitaria podría comenzar con una arquitectura más económica y agregar mayor redundancia a medida que aumentaran los usuarios y la importancia de los documentos.

Por ejemplo, el ambiente de desarrollo podría utilizar una única tarea de ECS y una base RDS Single-AZ. En producción utilizaría al menos dos tareas distribuidas entre zonas y RDS Multi-AZ.