from flask import Flask, render_template, request, redirect

app = Flask(__name__)

# Usuario de demostración
USUARIO = "alejandra"
PASSWORD = "1234"


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        usuario = request.form["usuario"]
        password = request.form["password"]

        if usuario == USUARIO and password == PASSWORD:
            return redirect("/agenda")

        else:
            return render_template(
                "login.html",
                error="Usuario o contraseña incorrectos."
            )

    return render_template("login.html")


@app.route("/agenda")
def agenda():
    return render_template("agenda.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)