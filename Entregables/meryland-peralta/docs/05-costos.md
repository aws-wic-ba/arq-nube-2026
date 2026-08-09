05 — Estimación de costos

Servicios mas costosos

| Servicio | Costo estimado/mes | Notas |
|----------|-------------------:|-------|
| Amazon RDS PostgreSQL | ~$98 | Es el componente más caro. |
| Amazon ECS Fargate | ~$11 | Backend con 0.5 vCPU y 1 GB de memoria. |
| Application Load Balancer | ~$23 | Depende del tráfico de usuarios. |
| Amazon CloudWatch | ~$3 | Depende del volumen de logs. |


Total estimado: ~$140/mes para una carga pequeña


Decisiones de optimización tomadas

•	Amazon RDS PostgreSQL: Se redujo el almacenamiento inicial a 20 GB, ya que la aplicación se encuentra en su primera versión y no requiere una gran capacidad de almacenamiento.
•	Amazon ECS Fargate: Se configuró una única tarea (1 Task) para atender la carga inicial de usuarios, evitando ejecutar múltiples contenedores innecesarios.
•	Amazon ECS Fargate: Se estimó un tiempo de ejecución de 12 horas diarias para reducir costos durante la etapa inicial del proyecto.
•	Application Load Balancer: Se configuró una estimación de 1 conexión nueva por segundo, considerando un bajo volumen de usuarios.
•	Auto Scaling: En futuras versiones permitirá aumentar o disminuir automáticamente la capacidad según la demanda, evitando pagar por recursos ociosos.


Lo que evitaríamos en una primera versión

•	Configurar Amazon RDS Multi-AZ, ya que una única zona de disponibilidad es suficiente para una aplicación con pocos usuarios y permite reducir costos.
•	Implementar varias tareas de Amazon ECS Fargate. Una sola tarea puede atender la demanda inicial.
•	Configurar Auto Scaling desde el primer día, ya que la aplicación tendrá un bajo volumen de tráfico.
•	Implementar CloudFront únicamente cuando la aplicación requiera atender usuarios desde diferentes ubicaciones geográficas y se necesite reducir la latencia.
