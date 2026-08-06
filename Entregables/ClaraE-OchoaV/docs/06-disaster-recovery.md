# Plan de Disaster Recovery

## Objetivo

Garantizar la continuidad del servicio y minimizar la pérdida de información ante una falla.

## Riesgos identificados

- Caída de la instancia EC2.
- Falla de la base de datos.
- Error humano.
- Fallo de conectividad.

## Estrategia

La estrategia propuesta es **Backup & Restore**.

Se realizarán respaldos automáticos de la base de datos mediante Amazon RDS y se mantendrá una copia del código en GitHub.

## RTO

30 minutos.

## RPO

15 minutos.

## Recuperación

En caso de falla:

1. Restaurar la base de datos desde el último respaldo.
2. Crear una nueva instancia EC2.
3. Desplegar nuevamente la aplicación Docker.
4. Verificar el funcionamiento del sistema.

## Mejoras futuras

- Implementar una arquitectura Multi-AZ.
- Utilizar un Load Balancer.
- Automatizar el despliegue mediante CI/CD.