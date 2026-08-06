# 01 — Descripción de la aplicación

## ¿Qué hace la app?

**EcoCanje** es una aplicación web de recolección de materiales reciclables con sistema de puntos. Los vecinos publican el material que juntan (plástico, papel/cartón o vidrio, una publicación por tipo de material), los emprendedores responden esas publicaciones para retirarlo, y cuando ambos confirman la transacción el vecino gana 5 puntos. Esos puntos se canjean por productos que los emprendedores ofrecen en sus comercios, ubicables en un mapa.

## ¿Por qué la elegí?

Muchos vecinos separan sus residuos pero no saben a quién dárselos, y hay emprendedores que necesitan ese material como insumo. EcoCanje conecta las dos puntas y, con los puntos canjeables en comercios del barrio, hace que reciclar tenga un beneficio concreto y mueva la economía local.

## ¿A quién está dirigida?

Se vende a **municipios**: cada municipio es el administrador de su territorio. Dentro de cada territorio la usan dos perfiles: **vecinos** (juntan y publican material) y **emprendedores** (recolectan el material y ofrecen productos para canje).

## Alcance del MVP

La versión entregada demuestra la lógica de negocio central —publicaciones, doble confirmación, puntos y canje— sin login: desde la misma pantalla se simulan las acciones del vecino y del emprendedor. La autenticación con roles (municipio, vecino, emprendedor) es el siguiente paso; fue una decisión de alcance para el MVP, no un olvido.

## Base de datos: PostgreSQL

Elegí una base de datos **relacional** porque los datos tienen relaciones claras: municipios → usuarios → publicaciones → transacciones → puntos. Necesito consistencia transaccional para que los puntos se acrediten solo cuando ambas partes confirman (y una sola vez), y para que el canje descuente puntos y dé de baja el producto como una única operación atómica. PostgreSQL además permite sumar consultas geográficas con PostGIS para el mapa de comercios.
