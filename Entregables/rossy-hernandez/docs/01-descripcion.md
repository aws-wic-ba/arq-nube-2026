# 01 — Descripción de la aplicación

## ¿Qué hace la app?

**Plataforma de Donaciones** es una aplicación web serverless para la
gestión de donantes de una fundación dedicada a un hospital pediátrico
oncológico. Permite que un donante se registre a través de un formulario
web, quedando su información almacenada de forma segura en la nube para
su posterior seguimiento (historial de donaciones, transparencia y
reportes).

## ¿Por qué la eligieron?

Muchas fundaciones pequeñas siguen gestionando sus donantes en planillas
de Excel o formularios sueltos, sin trazabilidad ni forma de mostrar
transparencia a sus donantes. Esta plataforma resuelve ese problema con
un registro estructurado, auditable y preparado para escalar hacia un
dashboard público de transparencia y reportes financieros.

## ¿A quién está dirigida?

- **Donantes** (personas naturales o empresas) que quieren aportar y,
  opcionalmente, mantenerse anónimos frente al público.
- **La fundación**, que necesita un registro confiable de donantes y,
  a futuro, de sus donaciones y reportes financieros.

## Base de datos: Amazon DynamoDB (NoSQL)

Se eligió una base de datos **NoSQL, serverless y sin esquema fijo** en
lugar de una relacional, por las siguientes razones:

- **Costo**: el modo *On-Demand* cobra solo por operación real, sin
  reservar capacidad — ideal para una fundación con tráfico bajo e
  irregular (picos en campañas puntuales).
- **Sin administración de servidores**: no hay instancia de base de
  datos que mantener, parchear ni escalar manualmente.
- **Modelo de acceso simple y predecible**: la consulta principal del
  negocio es "traer los datos de un donante" y "traer el historial de
  donaciones de un donante" — un patrón que DynamoDB resuelve de forma
  nativa con `partition key` + `sort key`, sin necesidad de `JOIN`s.
- **Escalado automático**: si en una campaña de fin de año llegan miles
  de donaciones simultáneas, DynamoDB escala sola, sin intervención.

### Diseño de tablas

| Tabla | Partition Key | Sort Key | Propósito |
|---|---|---|---|
| `Donantes` | `Donante_id` (String, UUID) | — | Datos del donante: nombre, tipo, identificación, correo, anonimato |
| `Donaciones` | `Donante_id` (String) | `fecha_donacion` (String, ISO 8601) | Historial de donaciones por donante, sin sobrescrituras y ordenado cronológicamente |

El `Donante_id` se genera con `uuid4()` en el backend, evitando
condiciones de carrera si dos donaciones se procesan en paralelo.
