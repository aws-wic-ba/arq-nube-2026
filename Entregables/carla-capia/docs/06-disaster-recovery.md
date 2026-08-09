# 06 — Disaster Recovery

## Contexto del negocio

PeluApp está pensada para una peluquería o salón de belleza. Los turnos suelen concentrarse en horarios comerciales y, especialmente, antes de fines de semana y fechas de mucho flujo

Una caída en horario de atención no necesariamente implica una pérdida económica masiva inmediata, pero sí puede provocar:
- clientes que no pueden reservar;
- empleados que no pueden consultar la agenda;
- riesgo de tomar turnos por canales alternativos;
- pérdida de confianza;
- duplicación de  de reservas si se vuelve a registrar información manual 

Por eso el componente más crítico es la **agenda de turnos y su integridad**.

## Mantenimiento

Los cambios que puedan provocar una interrupción deberían programarse fuera de los horarios de mayor demanda.

Una ventana razonable para mantenimiento de la aplicación sería durante la noche, por ejemplo después del cierre del local.

Las tareas de backup y mantenimiento de base de datos deberían configurarse para evitar coincidir con el período de mayor uso.

# 06 — Disaster Recovery (Recuperación ante Desastres)

Para PeluApp se define una estrategia de recuperación proporcional al tamaño de una peluquería pequeña. El objetivo es mantener la aplicación disponible ante fallas de infraestructura y poder recuperar los datos ante errores lógicos, borrados accidentales o corrupción.

## 1. Objetivos de Recuperación

- **RTO (Recovery Time Objective):** hasta **1 hora** ante una falla que requiera intervención o restauración.
- **RPO (Recovery Point Objective):** hasta **15 minutos** de pérdida de datos como máximo.

Estos valores resultan razonables para PeluApp porque una interrupción puede impedir reservar o consultar turnos, pero no representa un servicio crítico de emergencia.

---

## 2. Alta Disponibilidad vs. Disaster Recovery

Es importante diferenciar ambos conceptos:

- **Alta disponibilidad:** busca que el servicio continúe funcionando ante fallas de infraestructura. En PeluApp se logra principalmente mediante **ECS distribuido en Availability Zones** y **RDS Multi-AZ**, junto con **ALB**.
- **Disaster Recovery:** permite recuperar el sistema ante pérdida o corrupción de datos, errores humanos o incidentes de mayor alcance. Para esto se utilizan los **backups de RDS** y recuperación de la base de datos.

---

## 3. Estrategia de recuperación por escenario

| Escenario | Respuesta |
|---|---|
| **Falla de una tarea ECS** | ECS reemplaza la tarea y el **ALB** continúa enviando tráfico a las tareas disponibles. |
| **Falla de una Availability Zone** | Las tareas de ECS distribuidas en otra AZ pueden continuar atendiendo solicitudes. **RDS Multi-AZ** permite realizar failover de la base de datos. |
| **Falla de RDS** | RDS utiliza la instancia secundaria de **Multi-AZ** para recuperar la disponibilidad automáticamente. |
| **Borrado o corrupción de datos** | Se utiliza la recuperación de backups de **RDS** para restaurar la información a un punto anterior al incidente. |
| **Falla de la aplicación** | Se vuelve a desplegar una imagen estable almacenada en **Amazon ECR**. |
| **Caída regional** | Se realiza una recuperación mediante backups y reconstrucción de la infraestructura en otra región, si el impacto del incidente lo justifica. |

---

## 4. Backups y recuperación

### Amazon RDS

- Se habilitan **backups automáticos**.
- Se mantiene una política de retencion adecuada para recuperar información eliminada o dañada.
- **RDS Multi-AZ** se utiliza para alta disponibilidad, no como sustituto de los backups.
- Ante corrupción lógica o un error humano, se restaura la base de datos desde un backup anterior.

### Amazon ECR

Las imágenes Docker de PeluApp se conservan en **ECR**, permitiendo reconstruir o desplegar nuevamente la aplicación ante una falla de ECS.

---

## 5. Procedimiento de recuperación

Ante un incidente:

1. **CloudWatch** permite detectar errores o indisponibilidad.
2. Se determina si el problema corresponde a una tarea ECS, una Availability Zone, RDS o a los datos.
3. Si es ua falla de infraestructura, se espera la recuperación automática de ECS/RDS.
4. Si existe pérdida o corrupción de datos, se restaura RDS desde el backup correspondiente.
5. Si la aplicación necesita ser reconstruida, se utiliza la imagen almacenada en **ECR**.
6. Se verifica el funcionamiento mediante el **ALB** antes de considerar recuperado el servicio.

---

## 6. Caída regional

Para la primera versión de PeluApp no se mantiene una infraestructura activa en una segunda región. El costo y la complejidad de una arquitectura Multi-Region no se justifican para el nivel de criticidad de una peluquería pequeña.

Ante una caída regional prolongada, la estrategia sería **Backup & Restore**:

- Recuperar los backups disponibles.
- Recrear la infraestructura necesaria en una región alternativa.
- Desplegar nuevamente la imagen de la aplicación desde una copia disponible en la región alternativa.
- Configurar el acceso mediante **Route 53**.
- Verificar la aplicación antes de restablecer el servicio.

Esta estrategia implica un tiempo de recuperación mayor que una arquitectura Multi-Region, pero es proporcional al impacto que tendría una interrupción prolongada sobre el negocio.

---

## 7. Pruebas del plan de recuperación

Para comprobar que el plan funciona se realizarían periódicamente:

- Pruebas de restauración de backups de **RDS**.
- Simulación de una tarea ECS caída.
- Verificación de los health checks del **ALB**.
- Pruebas de recuperación de la aplicación utilizando una imagen anterior de **ECR**.
- Verificación de los logs y alarmas de **CloudWatch**.
- Simulación controlada de recuperación de la base de datos después de un error lógico.

## Conclusión

La estrategia de PeluApp combina **alta disponibilidad mediante ECS, ALB y RDS Multi-AZ** con una estrategia de **Backup & Restore** para la recuperación de datos. De esta manera se cubren tanto las fallas de infraestructura como los errores lógicos, manteniendo una solución de Disaster Recovery acorde al tamaño y las necesidades del negocio.