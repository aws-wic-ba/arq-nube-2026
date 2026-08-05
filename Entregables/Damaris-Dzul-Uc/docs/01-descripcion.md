# Descripción de la app

## ¿Qué hace la app?

**Becas Hunucmá** digitaliza el proceso de solicitud de becas universitarias del ayuntamiento de Hunucmá, Yucatán, México. Hoy el trámite es en papel: el solicitante llena un formulario físico y entrega documentos (INE, acta de nacimiento, comprobante de estudios, comprobante de domicilio) en ventanilla, y el personal municipal revisa documento por documento, solicitud por solicitud, para verificar que esté completa antes de poder evaluarla.

La app traslada ese formulario a la web y agrega una validación automática de completitud: cuando el solicitante sube sus documentos, el sistema chequea al instante cuáles faltan y marca la solicitud como `incompleta` o `completa`. El trabajador del ayuntamiento ya no revisa carpeta por carpeta buscando qué falta — filtra directamente por `completa` y sólo entran a su cola las solicitudes listas para evaluación humana (aprobar/rechazar).

## ¿Por qué la elegí?

Vivo en Hunucmá y noté este problema de primera mano: el trámite de becas municipales es completamente manual. El cuello de botella no es evaluar si alguien merece la beca — eso requiere criterio humano y no lo automatizo — sino el trabajo repetitivo de fijarse si falta un documento antes de poder evaluar. Automatizar esa parte libera tiempo del personal municipal, que es limitado, y reduce idas y vueltas del solicitante (hoy si le falta un papel se entera en ventanilla, no antes).

## ¿Quiénes son los usuarios?

- **Solicitantes** (estudiantes de Hunucmá que aplican a la beca): usuarios externos, público general, sin cuenta previa en el sistema municipal.
- **Trabajadores del ayuntamiento** (personal de la Dirección de Juventud - Hunucmá, que es quien administra las becas universitarias): usuarios internos que revisan y resuelven (aprueban/rechazan) las solicitudes ya filtradas.

## Base de datos

Uso **PostgreSQL**, una base relacional. La elegí porque el dominio es naturalmente relacional y con integridad referencial clara: una solicitud tiene muchos documentos (`solicitudes` 1—N `documentos`), y necesito consultas por estado (`WHERE estado = 'completa'`) que en SQL son directas e indexables. No hay datos no estructurados ni necesidad de escalar a millones de escrituras por segundo — es una app de trámites municipales con volumen bajo/moderado (cientos o pocos miles de solicitudes por convocatoria), así que no se justifica una NoSQL. Además PostgreSQL da constraints (`UNIQUE`, `FOREIGN KEY`) que uso para evitar, por ejemplo, que se suba dos veces el mismo tipo de documento para la misma solicitud.
