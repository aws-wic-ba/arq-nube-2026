# 01 — Descripción de la aplicación: RemediarJuntos

## ¿Qué hace la app?

**RemediarJuntos** es una plataforma web solidaria que conecta a instituciones de salud y fundaciones con donantes particulares y empresas para facilitar la donación de medicamentos e insumos médicos urgentes. 

Las instituciones publican sus necesidades críticas (monodroga, dosis, cantidad necesaria y punto de recepción), permitiendo a los donantes visualizar el avance de las campañas en tiempo real y registrar donaciones en especie o aportes de fondos para envíos. Además, incluye un sistema de geolocalización por ubicación para mostrar los puntos de recepción más cercanos al donante.

## ¿Por qué la eligieron?

Muchas fundaciones y centros de salud dependen de publicaciones informales en redes sociales para conseguir medicamentos urgentes. Esto genera falta de trazabilidad, incertidumbre sobre si se alcanzó el objetivo y fricción para coordinar la entrega. 

RemediarJuntos resuelve este problema centralizando los pedidos, mostrando métricas transparentes de recaudación e integrando un buscador de cercanía para agilizar la logística de donación.

## ¿A quién está dirigida?

* **Instituciones y Fundaciones de Salud:** Que necesitan gestionar y visibilizar sus faltantes de insumos o medicamentos críticos de forma organizada.
* **Donantes Particulares:** Personas físicas que cuentan con medicamentos sin usar en sus casas o desean colaborar financieramente con los envíos.
* **Empresas y Laboratorios:** Organizaciones que buscan realizar donaciones en lote o apoyar campañas sanitarias específicas.

## Base de datos: PostgreSQL + PostGIS

Elegimos una base de datos **relacional** porque la información posee relaciones estrictas: instituciones → campañas → donaciones → donantes. 

Necesitamos **consistencia transaccional (propiedades ACID)** para evitar la sobre-donación de insumos y asegurar que, al completarse la meta de un medicamento, el estado de la campaña cambie de forma atómica. 

Asimismo, se seleccionó PostgreSQL por su extensión espacial **PostGIS**, la cual permite almacenar coordenadas geográficas e indexar consultas geoespaciales nativas (vía `ST_DWithin`). Esto resuelve las búsquedas por radio de cercanía entre el donante y la fundación en milisegundos directamente en el motor de la base de datos, garantizando alto rendimiento y escalabilidad.
