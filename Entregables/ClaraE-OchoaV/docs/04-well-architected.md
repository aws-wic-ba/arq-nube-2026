# AWS Well-Architected Framework

La propuesta de SecureReport considera los siguientes pilares del AWS Well-Architected Framework.

## Excelencia Operacional

La aplicación se ejecuta mediante Docker, lo que facilita su despliegue y mantenimiento.

## Seguridad

La infraestructura utiliza una VPC privada, Security Groups y una base de datos administrada por Amazon RDS para proteger la información.

## Confiabilidad

Amazon RDS realiza respaldos automáticos y EC2 puede reiniciarse fácilmente en caso de fallos.

## Eficiencia del Rendimiento

La aplicación utiliza recursos livianos mediante Flask y PostgreSQL, suficientes para una carga moderada de usuarios.

## Optimización de Costos

Se propone utilizar instancias pequeñas como t3.micro y servicios administrados para reducir costos de administración.

## Sostenibilidad

Al utilizar servicios administrados y recursos ajustados a la demanda, se evita el desperdicio de infraestructura y consumo innecesario de energía.