from flask import Flask, render_template, request

app = Flask(__name__)

incidentes = []

@app.route("/")
def home():
    return render_template("index.html", incidentes=incidentes)

@app.route("/registrar", methods=["POST"])
def registrar():

    titulo = request.form["titulo"]
    descripcion = request.form["descripcion"]
    severidad = request.form["severidad"]

    incidentes.append({
        "titulo": titulo,
        "descripcion": descripcion,
        "severidad": severidad
    })

    return render_template("index.html", incidentes=incidentes)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)