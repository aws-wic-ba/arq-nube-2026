from flask import Flask, abort, render_template
app = Flask(__name__)

# Datos que simulan las oportunidades almacenadas en DynamoDB.
# Más adelante, en AWS, estos datos llegarían a través de:
# API Gateway → Lambda → DynamoDB.

OPORTUNIDADES = [
    {
        "id": 1,
        "asin": "B0PET001",
        "producto": "Cepillo quitapelos para mascotas",
        "categoria": "Mascotas",
        "precio": 19.90,
        "rating": 3.8,
        "reviews": 1240,
        "competencia": "Media",
        "score": 92,
        "estado": "Oportunidad alta",
        "reviews_negativas": 32,
        "seo": "Muy pobre",
        "tendencia": "Rating en descenso",

        "factores_score": [
                            {"nombre": "Competencia", "valor": "Media"},
                            {"nombre": "Rating", "valor": "3.8"},
                            {"nombre": "Reviews negativas", "valor": "32%"},
                            {"nombre": "SEO", "valor": "Muy pobre"},
                            {"nombre": "Tendencia", "valor": "Descendente"},
        ],

        "confianza_modelo": 96,

        "fuentes": ["Amazon SP-API", "Keepa", "Reddit"],

        "insight": (
            "El listado presenta un descenso sostenido en el rating, "
            "contenido SEO poco optimizado y comentarios frecuentes sobre "
            "la durabilidad del producto."
        ),

        "recomendacion": (
            "Conviene lanzar una alternativa premium, con materiales "
            "más resistentes, una propuesta visual mejorada y una ficha "
            "de producto optimizada para búsquedas."
        ),
        "fuentes": ["Amazon SP-API", "keepa", "Reddit"],
        "insight": (
            "El listado presenta un descenso sostenido en el rating, "
            "contendio SEO poco optimizado y comentarios frecuentes sobre "
            "la durabilidad del produto. Existe una oportunidad de mejora "
            "mediante una propuesta más resistente y una ficha mejor optimizada."
            
        ),
    },
    {
        "id": 2,
        "asin": "B0PET002",
        "producto": "Organizador modular de cocina",
        "categoria": "Hogar y cocina",
        "precio": 34.50,
        "rating": 4.1,
        "reviews": 860,
        "competencia": "Alta",
        "score": 84,
        "estado": "Oportunidad media",
        "reviews_negativas": 32,
        "seo": "Muy pobre",
        "tendencia": "Rating en descenso",

        "factores_score": [ 
                            {"nombre": "Competencia", "valor": "Alta"},
                            {"nombre": "Rating", "valor": "4.1"},
                            {"nombre": "Reviews negativas", "valor": "32%"},
                            {"nombre": "SEO", "valor": "Muy pobre"},
                            {"nombre": "Tendencia", "valor": "Demanda estable"},
        ],

        "confianza_modelo": 93,

        "fuentes": ["Amazon SP-API", "Keepa", "Reddit"],

        "insight": (
            "El listado presenta un descenso sostenido en el rating, "
            "contenido SEO poco optimizado y comentarios frecuentes sobre "
            "la durabilidad del producto."
        ),

        "recomendacion": (
            "Conviene lanzar una alternativa premium, con materiales "
            "más resistentes, una propuesta visual mejorada y una ficha "
            "de producto optimizada para búsquedas."
        ),
        "fuentes": ["Amazon SP-API", "keepa"],
        "insight": (
            "La demanda permanece estable, pero varios competidores tienen "
            "imágenes deficientes y descripciones incompletas. La oportunidad "
            "la durabilidad del produto. Existe una oportunidad de mejora "
            "está en mejorar la presentación y deferenciar el diseño."
            
        ),
    },
    {
        "id": 3,
        "asin": "B0GAR003",
        "producto": "Sistema de riego para balcones",
        "categoria": "Jardín",
        "precio": 27.99,
        "rating": 3.6,
        "reviews": 540,
        "competencia": "Baja",
        "score": 89,
        "estado": "Oportunidad alta",
        "reviews_negativas": 32,
        "seo": "Muy pobre",
        "tendencia": "Rating en descenso",

        "factores_score": [
                            {"nombre": "Competencia", "valor": "Baja"},
                            {"nombre": "Rating", "valor": "3.6"},
                            {"nombre": "Reviews negativas", "valor": "38%"},
                            {"nombre": "SEO", "valor": "Mejorable"},
                            {"nombre": "Tendencia", "valor": "Estacional positiva"},
        ],

        "confianza_modelo": 91,

        "fuentes": ["Amazon SP-API", "Keepa", "Reddit"],

        "insight": (
            "El listado presenta un descenso sostenido en el rating, "
            "contenido SEO poco optimizado y comentarios frecuentes sobre "
            "la durabilidad del producto."
        ),

        "recomendacion": (
            "Conviene lanzar una alternativa premium, con materiales "
            "más resistentes, una propuesta visual mejorada y una ficha "
            "de producto optimizada para búsquedas."
        ),
        "fuentes": ["Amazon SP-API", "Keepa", "Reddit"],
        "insight": (
            "Las reseñas indican problemas de instalación y pérdidas de agua. "
            "La baja competencia y la demanda estacional generan una oportunidad "
            "para ofrecer un sistema más simple, confiable y mejor documentado."
        ),
    },
]

@app.route("/")
def dashboard():
    """Muestra las oportunidades detectadas por el Radar Tracker."""
    oportunidades_ordenadas = sorted(
        OPORTUNIDADES,
        key=lambda oportunidad: oportunidad["score"],
        reverse=True,
    )

    return render_template(
        "index.html",
        oportunidades=oportunidades_ordenadas,
    )


@app.route("/oportunidad/<int:oportunidad_id>")
def detalle_oportunidad(oportunidad_id: int):
    """Muestra el análisis detallado de una oportunidad."""
    oportunidad = next(
        (
            item
            for item in OPORTUNIDADES
            if item["id"] == oportunidad_id
        ),
        None,
    )

    if oportunidad is None:
        abort(404)

    return render_template(
        "detalle.html",
        oportunidad=oportunidad,
    )


@app.errorhandler(404)
def pagina_no_encontrada(error):
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
    )