# 05 - Estimación de Costos

Criterios para mi estimación:
- Tarifas de la región us-east-1 tipo 'on-demand' (sin compromisos a largo plazo con usos reservados o Saving Plans). 
- App en etapa inicial productiva con tráfico bajo (entre 300 y 1000 usuarios activos por mes, pero con uso esporádico).


## Estimación mensual por servicio

| Servicio | Supuesto de uso | Costo estimado/mes (USD) |
|---|---|---|
| **RDS Serverless** | 0.5-1 ACU promedio (mínimo posible) + almacenamiento (~10 GB) | **~$45-90** |
| **ECS Fargate** | 2 tareas de 1 GB c/u, corriendo 24/7 | **~$36** |
| **Application Load Balancer** | activo 24/7 + tráfico bajo | **~$22** |
| **S3 + CloudFront** | Front estático (pocos MB) + tráfico bajo | **~$1-2** |
| **Route 53** | 1 hosted + consultas DNS | **~$0.50** |
| **Cognito** | Usuarios dentro del "free tier" | **$0** |
| **EventBridge Scheduler + SNS** | 1 revisión diaria + notificaciones puntuales | **< $1** |
| **NAT Gateway** | 1 activo 24/7, para el backend | **~$35-40** |
| **CloudWatch** | Logs del backend + ~5-6 alarmas básicas | **~$3-5** |
| **Total estimado** | | entre 145-195 $USD/mes **(< 200 $USD/mes)**|

## Servicios más costosos de la arquitectura

1. **RDS Serverless**: Es el elemento más costoso.. incluso en el mínimo, su costo base es mayor a ECS Fargate. Adicionalmente si el uso real crece a un ritmo acelerado aumenta el costo estimado.
2. **NAT Gateway**: Tiene cargo fijo + costo por GB procesado. Necesario para aislar el backend, y que siga teniendo conexiones salientes del backend.
3. **ECS Fargate**: Por la redundacia, se dejan corriendo 2 tareas en paralelo. Esto duplica el costo de cómputo respecto a una sola.
4. **ALB**: Sin importar que sea una app pequeña y sencilla, ese elemento tiene un cargo fijo por hora que se paga exista o no tráfico.

## Decisiones tomadas para optimizar costos

- **Fargate en vez de EC2 & RDS Serverless en vez de instancia fija**: al ser tráfico irregular, pagar por capacidad que escala con el uso real es más barato que mantener servidores/instancias fijas sin uso la mayor parte del tiempo.
- **S3 + CloudFront**: el frontend hace uso de archivos estáticos, es innecesario pagar por cómputo (servidor) teniendo la opción de hacerlo con S3.
- **EventBridge Scheduler**: se paga por ejecución puntual (una vez al día, ej 8am), en vez de un proceso corriendo o escuchando 24/7 esperando la fecha del recordatorio.
- **Solo un NAT Gateway**: si bien por resiliencia es conveniente uno por AZ, se prioriza el costo sobre la redundancia. Si esa AZ tiene un problema, el backend pierda temporalmente la salida a internet pero sigue respondiendo a los usuarios (habla internamente con los otros servicios de AWS).

## Qué evitaría o simplificaría en una primera versión

- **Sacar el NAT Gateway**: en instancia de desarrollo o demo, sin datos sensibles de producción, correría las tareas de Fargate con IP pública (en subredes públicas, restringido por grupo de seguridad) en vez de subredes privadas + NAT. Si bien sería "alcanzable" desde internet, el SG bloquea todo el tráfico entrante salvo que venga del ALB. Esto resigna el aislamiento de red, pero elimina el segundo costo más alto de toda la arquitectura. Es un opción reversible cuando pase a producción con datos de usuarios.
- **Correr 1 sola tarea de Fargate**: pierda la tolerancia a fallos. Si esa única tarea se cae, hay un corte breve hasta que ECS levanta otra, pero para una primera versión sin usuarios reales, es un riesgo-beneficio razonable que corta a la mitad ese costo.

Con estos 2 cambios, se reduce el costo en etapa demo, a unos 100-145 $USD/mes (menor o igual al costo mínimo estimado en etapa productiva).

