# Estimación de Costos

La aplicación SecureReport fue diseñada para una implementación de bajo costo utilizando el Free Tier de AWS siempre que sea posible.

## Servicios utilizados

- Amazon EC2 t3.micro
- Amazon RDS PostgreSQL (db.t3.micro)
- Amazon VPC
- Security Groups
- Internet Gateway

## Estimación

Para un entorno de pruebas o académico, el costo mensual puede mantenerse muy bajo utilizando instancias pequeñas y recursos mínimos.

En un entorno productivo, el costo dependerá del tráfico, almacenamiento y capacidad requerida.

## Decisiones tomadas

- Utilizar una única instancia EC2.
- Utilizar PostgreSQL administrado por Amazon RDS.
- Aprovechar el Free Tier cuando esté disponible.
- Escalar únicamente cuando sea necesario.