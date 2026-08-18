
# 01 — Descripción de la aplicación

## ¿Qué hace la app?

**MamaBank** es una app de gestión de gastos para adolescentes con
aprobación de sus padres. El/la adolescente carga solicitudes de compra
(qué quiere comprar, monto, categoría, foto opcional) y el padre/madre las
aprueba —total o parcialmente— o las rechaza con una nota. Al aprobar, el
monto se acredita al saldo del adolescente (no hay transferencia bancaria
real).

## ¿Por qué la eligieron?

Surgió de mi día a día con mi hija la necesidad de compra que tiene todo
el tiempo, y el poco control real que yo tenía sobre sus decisiones de
compra antes de que la plata ya estuviera gastada. MamaBank ordena ese
"¿puedo comprar esto?" antes de que pase, en vez de enterarme después.

## ¿A quién está dirigida?

Está dirigida a padres de adolescentes que no pueden seguirle el paso al consumo desmedido de los hijos.

## Base de datos: PostgreSQL

Elegí una base de datos relacional  porque los datos tienen relaciones claras: padres → hijos → solicitudes, 
con esquema de filas y columnas que ayuda a cuidar la integridad (por ejemplo, que no exista una solicitud sin un adolescente válido). 
Puntualmente elegí PostgreSQL por su arquitectura cliente-servidor, alta concurrencia para lecturas/escrituras simultáneas (varios hijos pidiendo mientras el padre aprueba)