# 01 — Descripción de la aplicación

#### ¿Qué hace la app?

**CatalogoApp** es un catálogo de productos que permite a los usuarios crear y consultar productos con información como id de producto, nombre, descripción, precio y stock.

#### 

#### ¿Por qué la eligieron?

**CatalogoApp** sirve para organizar, mostrar y vender la oferta de cualquier empresa de forma clara. Facilita que los usuarios conozcan los precios y los datos esenciales para tomar una decisión de compra rápida.



#### ¿A quién está dirigida?

**CatalogoApp** en su version MVP, esta dirigida a dos tipos de públicos. Al consumidor final (B2C o Business to Consumer) que buscan un producto para su propio uso o disfrute personal, los cuales pueden ser compradores indecisos que exploran opciones antes de tomar una decisión de compra, clientes recurrentes que ya conocen la marca y buscan novedades, ofertas o reposiciones. A clientes corporativos (B2B o Business to Business ), empresas que compran grandes volúmenes para revender los productos, proveedores de servicios que necesitan insumos, herramientas o materiales para su actividad, encargados de compras de otras compañías que buscan optimizar costos y cotizar suministros.



#### Base de datos: DynamoDB

Elegí una base de datos no relacional (NoSQL) para un catálogo de productos debido a la flexibilidad para manejar la heterogeneidad de los productos sin complicar la estructura de la base de datos pensando en un catálogo de artículos con características totalmente diferentes que un modelo rígido tradicional ralentiza o encarece.

Una BD NoSQL brinda:

1-Diversidad de atributos sin penalizaciones, se puede guardar una prenda y una laptop en la misma colección o tabla, cada una con sus propiedades específicas, sin dejar columnas vacías -(nulos) y sin alterar la base de datos.

2- Lanzamientos de productos más rápidos: si el negocio decide vender una nueva categoría con atributos nunca antes vistos, los desarrolladores los agregan al instante sin detener la plataforma para hacer migraciones de esquema.

3- Soporte nativo para formatos web: los catálogos se almacenan comúnmente en formato JSON (en bases de datos de documentos como MongoDB o DynamoDB), lo que significa que los datos viajan del servidor a la aplicación del usuario sin necesidad de transformaciones complejas.

4- Lecturas ultra rápidas de la ficha de producto: toda la información de un producto (imágenes, variantes, opiniones, especificaciones) se guarda junta en un solo registro o documento, eliminando las consultas lentas con múltiples uniones (JOINs) de las bases de datos SQL.

5- Escalabilidad horizontal rentable: Permite absorber millones de visitas y consultas simultáneas distribuyendo la carga de datos en servidores económicos, manteniendo la tienda rápida y disponible durante temporadas de alta demanda.

