# Radar Tracker

## Descripción de la aplicación

Es una aplicación web diseñada para detectar oportunidades comerciales dentro del marketplace de Amazon. Su objetivo es ayudar a vendedores FBA a identificar productos con potencial de mejora mediante el análisis automático de información proveniente de diferentes fuentes.

La aplicación centraliza indicadores como posicionamiento, reseñas, tendencias y calidad de las publicaciones para calcular un Opportunity Score, permitiendo priorizar aquellas oportunidades con mayor potencial de negocio.

## ¿Por qué elegí esta aplicación?

Elegí este proyecto porque combina dos áreas que me interesan: la arquitectura cloud sobre AWS y el comercio electrónico. Además, representa un caso de uso real donde es posible aplicar servicios serverless, procesamiento de datos e inteligencia artificial para resolver un problema concreto.

## Usuarios

La aplicación está orientada a vendedores de Amazon FBA, consultores de e-commerce y pequeñas empresas que desean identificar oportunidades de mercado de forma más rápida y automatizada.

## Base de datos

La arquitectura propuesta utiliza Amazon DynamoDB como base de datos operacional debido a que permite almacenar información semiestructurada, ofrece baja latencia en las consultas y escala automáticamente sin necesidad de administrar servidores.

Los datos históricos y de análisis se almacenan en Amazon S3, permitiendo separar el almacenamiento analítico del almacenamiento operacional.