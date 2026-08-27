# Arquitectura Propuesta en AWS

## Objetivo

Implementar la aplicación SecureReport en la nube utilizando servicios administrados de AWS para mejorar la disponibilidad, escalabilidad y seguridad.

## Servicios AWS

### Amazon EC2

Hospedará la aplicación Flask ejecutándose dentro de un contenedor Docker.

### Amazon RDS

Almacenará la información de los incidentes utilizando PostgreSQL como base de datos administrada.

### Amazon VPC

Permitirá aislar la infraestructura dentro de una red privada y controlar el acceso a los recursos.

### Security Groups

Controlarán el tráfico permitido hacia la instancia EC2 y la base de datos RDS.

### Internet Gateway

Permitirá que los usuarios accedan a la aplicación desde Internet.

## Arquitectura

La solución estará compuesta por:

- Usuarios
- Internet
- Internet Gateway
- Amazon VPC
- Instancia EC2 con Docker y Flask
- Amazon RDS PostgreSQL

## Beneficios

- Mayor disponibilidad.
- Escalabilidad.
- Administración simplificada de la base de datos.
- Mejor seguridad mediante VPC y Security Groups.
- Facilidad para futuras ampliaciones.