import os
import sqlite3
from datetime import date, datetime

from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

DB_PATH = os.environ.get("DB_PATH", os.path.join("data", "panel.db"))


def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            contacto TEXT,
            plan TEXT NOT NULL,
            fecha_renovacion TEXT NOT NULL,
            ultima_interaccion TEXT NOT NULL,
            tickets_abiertos INTEGER NOT NULL DEFAULT 0,
            notas TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS historial_salud (
            fecha TEXT PRIMARY KEY,
            verde INTEGER NOT NULL,
            amarillo INTEGER NOT NULL,
            rojo INTEGER NOT NULL,
            salud_general INTEGER NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS valoraciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            tiempo_respuesta INTEGER NOT NULL,
            consulta_resuelta INTEGER NOT NULL,
            alineacion_valores INTEGER NOT NULL,
            comentario TEXT,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        )
        """
    )
    conn.commit()

    # Datos de ejemplo, solo si la tabla está vacía
    count = conn.execute("SELECT COUNT(*) AS c FROM clientes").fetchone()["c"]
    if count == 0:
        ejemplos = [
            ("Baires Retail SA", "Lucía Fernández", "Enterprise", "2026-09-05", "2026-08-10", 0,
             "Cliente ancla. Interesada en sumar un segundo país en 2027."),
            ("NovaTech Soluciones", "Martín Paz", "Growth", "2026-08-28", "2026-07-02", 3,
             "Tres tickets abiertos por lentitud del dashboard. Sin respuesta del CSM hace 3 semanas."),
            ("Grupo Andina Logística", "Carla Ibáñez", "Growth", "2026-10-15", "2026-08-12", 1,
             "Buen uso del producto. Evaluar upsell a plan Enterprise."),
            ("Estudio Ferrero & Asoc.", "Diego Ferrero", "Starter", "2026-08-22", "2026-06-30", 0,
             "Sin contacto hace más de 40 días. Riesgo de renovación silenciosa."),
            ("Puerto Sur Import", "Yamila Cortez", "Enterprise", "2026-12-01", "2026-08-14", 0,
             "Relación sólida. Referenciable para casos de éxito."),
        ]
        conn.executemany(
            """INSERT INTO clientes
               (nombre, contacto, plan, fecha_renovacion, ultima_interaccion, tickets_abiertos, notas)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            ejemplos,
        )
        conn.commit()

        # Historial de ejemplo (13 días previos) solo para que el gráfico se vea
        # poblado en la demo. A partir de hoy, cada entrada se genera con datos reales.
        from datetime import timedelta
        valores_demo = [52, 54, 53, 56, 58, 57, 60, 61, 63, 62, 65, 66, 68]
        base = date.today()
        historial_demo = [
            ((base - timedelta(days=13 - i)).isoformat(), 3, 1, 1, v)
            for i, v in enumerate(valores_demo)
        ]
        conn.executemany(
            """INSERT OR IGNORE INTO historial_salud (fecha, verde, amarillo, rojo, salud_general)
               VALUES (?, ?, ?, ?, ?)""",
            historial_demo,
        )
        conn.commit()

        # Valoraciones de ejemplo para los primeros 3 clientes
        valoraciones_demo = [
            (1, (base - timedelta(days=6)).isoformat(), 5, 1, 5, "Muy buena atención, responden rápido."),
            (1, (base - timedelta(days=2)).isoformat(), 4, 1, 5, ""),
            (2, (base - timedelta(days=4)).isoformat(), 2, 0, 3, "Todavía esperamos resolución del ticket."),
            (3, (base - timedelta(days=8)).isoformat(), 5, 1, 4, "Propuesta clara y alineada a lo que buscábamos."),
        ]
        conn.executemany(
            """INSERT INTO valoraciones
               (cliente_id, fecha, tiempo_respuesta, consulta_resuelta, alineacion_valores, comentario)
               VALUES (?, ?, ?, ?, ?, ?)""",
            valoraciones_demo,
        )
        conn.commit()
    conn.close()


def calcular_salud(fecha_renovacion, ultima_interaccion, tickets_abiertos):
    """Heurística simple de riesgo: cuanto más alto el puntaje, peor la salud de la cuenta."""
    hoy = date.today()
    fr = datetime.strptime(fecha_renovacion, "%Y-%m-%d").date()
    ui = datetime.strptime(ultima_interaccion, "%Y-%m-%d").date()

    dias_a_renovacion = (fr - hoy).days
    dias_sin_contacto = (hoy - ui).days

    riesgo = 0
    if dias_a_renovacion < 30:
        riesgo += 2
    elif dias_a_renovacion < 60:
        riesgo += 1

    if dias_sin_contacto > 30:
        riesgo += 2
    elif dias_sin_contacto > 14:
        riesgo += 1

    if tickets_abiertos >= 3:
        riesgo += 2
    elif tickets_abiertos >= 1:
        riesgo += 1

    if riesgo >= 4:
        estado = "rojo"
    elif riesgo >= 2:
        estado = "amarillo"
    else:
        estado = "verde"

    return {
        "estado": estado,
        "riesgo": riesgo,
        "dias_a_renovacion": dias_a_renovacion,
        "dias_sin_contacto": dias_sin_contacto,
        "sugerencia": sugerencia_accion(estado, tickets_abiertos),
    }


def sugerencia_accion(estado, tickets_abiertos):
    """Traduce el estado en un próximo paso concreto para el account manager."""
    if estado == "rojo":
        texto = "Contactar esta semana: la renovación está en riesgo."
    elif estado == "amarillo":
        texto = "Agendar un check-in en las próximas dos semanas."
    else:
        texto = "Sin acción urgente. Buen momento para una nota de valor."

    if tickets_abiertos >= 3:
        texto += " Hay tickets acumulados, vale la pena escalarlos con soporte."

    return texto


MESES_ES = {
    "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun",
    "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
}


def grafico_lineal(datos, ancho=560, alto=130, color="#4457e0"):
    """Genera un sparkline SVG a partir de [(fecha, valor), ...] sin depender de librerías externas."""
    if not datos:
        return ""
    valores = [v for _, v in datos]
    minv, maxv = min(valores), max(valores)
    rango = (maxv - minv) or 1
    n = len(datos)
    paso_x = ancho / max(n - 1, 1)

    puntos = []
    for i, (_, v) in enumerate(datos):
        x = i * paso_x
        y = (alto - 24) - ((v - minv) / rango) * (alto - 44) + 10
        puntos.append((round(x, 1), round(y, 1)))

    polyline = " ".join(f"{x},{y}" for x, y in puntos)
    circles = "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="{color}"/>' for x, y in puntos)
    ultimo_x, ultimo_y = puntos[-1]
    return (
        f'<svg viewBox="0 0 {ancho} {alto}" class="chart-svg" preserveAspectRatio="none">'
        f'<polyline points="{polyline}" fill="none" stroke="{color}" stroke-width="2.5" '
        f'stroke-linejoin="round" stroke-linecap="round"/>'
        f'{circles}'
        f'<text x="{ultimo_x}" y="{max(ultimo_y - 10, 10)}" font-size="11" fill="{color}" '
        f'text-anchor="end" font-family="JetBrains Mono, monospace">{valores[-1]}%</text>'
        f'</svg>'
    )


def grafico_barras(datos, ancho=560, alto=130, color="#4457e0"):
    """Genera barras SVG a partir de [(etiqueta, valor), ...]."""
    if not datos:
        return ""
    n = len(datos)
    espacio = ancho / n
    ancho_barra = espacio * 0.5
    maxv = max(v for _, v in datos) or 1

    partes = []
    for i, (label, v) in enumerate(datos):
        h = (v / maxv) * (alto - 34)
        x = i * espacio + (espacio - ancho_barra) / 2
        y = (alto - 20) - h
        partes.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{ancho_barra:.1f}" height="{h:.1f}" rx="4" fill="{color}"/>')
        partes.append(
            f'<text x="{x + ancho_barra/2:.1f}" y="{y-6:.1f}" font-size="10" fill="{color}" '
            f'text-anchor="middle" font-family="JetBrains Mono, monospace">{v}%</text>'
        )
        partes.append(
            f'<text x="{x + ancho_barra/2:.1f}" y="{alto-4}" font-size="9.5" fill="#707c8c" '
            f'text-anchor="middle">{label}</text>'
        )
    return f'<svg viewBox="0 0 {ancho} {alto}" class="chart-svg" preserveAspectRatio="none">{"".join(partes)}</svg>'


def accion_del_dia(clientes):
    """Sugiere la única acción de hoy con más impacto en el puntaje: la cuenta de mayor riesgo."""
    if not clientes:
        return None
    prioritaria = clientes[0]  # ya viene ordenado con rojo primero
    if prioritaria["estado"] == "verde":
        return None
    return {"nombre": prioritaria["nombre"], "motivo": prioritaria["sugerencia"]}


def registrar_snapshot_y_tendencia(resumen):
    """Guarda una foto del estado de la cartera hoy y la compara con la medición anterior."""
    hoy = date.today().isoformat()
    total = resumen["total"] or 1
    salud_general = round(100 * (resumen["verde"] * 1 + resumen["amarillo"] * 0.5) / total)

    conn = get_db()
    anterior = conn.execute(
        "SELECT * FROM historial_salud WHERE fecha < ? ORDER BY fecha DESC LIMIT 1", (hoy,)
    ).fetchone()

    conn.execute(
        """INSERT INTO historial_salud (fecha, verde, amarillo, rojo, salud_general)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(fecha) DO UPDATE SET
             verde=excluded.verde, amarillo=excluded.amarillo,
             rojo=excluded.rojo, salud_general=excluded.salud_general""",
        (hoy, resumen["verde"], resumen["amarillo"], resumen["rojo"], salud_general),
    )
    conn.commit()
    conn.close()

    return {
        "salud_general": salud_general,
        "tiene_historial": anterior is not None,
        "delta": (salud_general - anterior["salud_general"]) if anterior else 0,
        "fecha_anterior": anterior["fecha"] if anterior else None,
    }


def obtener_valoraciones(cliente_id):
    conn = get_db()
    filas = conn.execute(
        "SELECT * FROM valoraciones WHERE cliente_id = ? ORDER BY fecha DESC", (cliente_id,)
    ).fetchall()
    conn.close()
    if not filas:
        return {"cantidad": 0, "promedio": None, "pct_resueltas": None, "detalle": []}

    promedio = sum((f["tiempo_respuesta"] + f["alineacion_valores"]) / 2 for f in filas) / len(filas)
    pct_resueltas = round(100 * sum(f["consulta_resuelta"] for f in filas) / len(filas))
    return {
        "cantidad": len(filas),
        "promedio": round(promedio, 1),
        "pct_resueltas": pct_resueltas,
        "detalle": filas,
    }


@app.route("/valorar/<int:cliente_id>", methods=["GET", "POST"])
def valorar_cliente(cliente_id):
    """Formulario público: el cliente valora la gestión de su Account Manager. Sin login."""
    conn = get_db()
    cliente = conn.execute("SELECT * FROM clientes WHERE id = ?", (cliente_id,)).fetchone()
    conn.close()
    if not cliente:
        return "Cliente no encontrado", 404

    if request.method == "POST":
        conn = get_db()
        conn.execute(
            """INSERT INTO valoraciones
               (cliente_id, fecha, tiempo_respuesta, consulta_resuelta, alineacion_valores, comentario)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                cliente_id,
                date.today().isoformat(),
                int(request.form["tiempo_respuesta"]),
                1 if request.form.get("consulta_resuelta") == "si" else 0,
                int(request.form["alineacion_valores"]),
                request.form.get("comentario", ""),
            ),
        )
        conn.commit()
        conn.close()
        return render_template("valorar_gracias.html", cliente=cliente)

    return render_template("valorar.html", cliente=cliente)


@app.route("/")
def dashboard():
    conn = get_db()
    filas = conn.execute("SELECT * FROM clientes ORDER BY fecha_renovacion ASC").fetchall()
    conn.close()

    clientes = []
    for fila in filas:
        salud = calcular_salud(fila["fecha_renovacion"], fila["ultima_interaccion"], fila["tickets_abiertos"])
        valoracion = obtener_valoraciones(fila["id"])
        clientes.append({**dict(fila), **salud, "valoracion": valoracion})

    orden_estado = {"rojo": 0, "amarillo": 1, "verde": 2}
    clientes.sort(key=lambda c: orden_estado[c["estado"]])

    resumen = {
        "total": len(clientes),
        "rojo": sum(1 for c in clientes if c["estado"] == "rojo"),
        "amarillo": sum(1 for c in clientes if c["estado"] == "amarillo"),
        "verde": sum(1 for c in clientes if c["estado"] == "verde"),
    }

    rendimiento = registrar_snapshot_y_tendencia(resumen)

    conn = get_db()
    filas_diario = conn.execute(
        "SELECT fecha, salud_general FROM historial_salud ORDER BY fecha DESC LIMIT 14"
    ).fetchall()
    filas_mensual = conn.execute(
        """SELECT substr(fecha, 1, 7) AS mes, ROUND(AVG(salud_general)) AS promedio
           FROM historial_salud GROUP BY mes ORDER BY mes"""
    ).fetchall()
    conn.close()

    datos_diario = [(f["fecha"], f["salud_general"]) for f in reversed(filas_diario)]
    datos_mensual = [
        (f"{MESES_ES[f['mes'][5:7]]} {f['mes'][2:4]}", int(f["promedio"])) for f in filas_mensual
    ]

    graficos = {
        "diario": grafico_lineal(datos_diario),
        "mensual": grafico_barras(datos_mensual),
    }

    foco_hoy = accion_del_dia(clientes)

    return render_template(
        "dashboard.html",
        clientes=clientes,
        resumen=resumen,
        rendimiento=rendimiento,
        graficos=graficos,
        foco_hoy=foco_hoy,
    )


@app.route("/cliente/nuevo", methods=["GET", "POST"])
def nuevo_cliente():
    if request.method == "POST":
        _guardar_cliente()
        return redirect(url_for("dashboard"))
    return render_template("form.html", cliente=None)


@app.route("/cliente/<int:cliente_id>/editar", methods=["GET", "POST"])
def editar_cliente(cliente_id):
    conn = get_db()
    if request.method == "POST":
        conn.close()
        _guardar_cliente(cliente_id)
        return redirect(url_for("dashboard"))

    cliente = conn.execute("SELECT * FROM clientes WHERE id = ?", (cliente_id,)).fetchone()
    conn.close()
    return render_template("form.html", cliente=cliente)


@app.route("/cliente/<int:cliente_id>/eliminar", methods=["POST"])
def eliminar_cliente(cliente_id):
    conn = get_db()
    conn.execute("DELETE FROM clientes WHERE id = ?", (cliente_id,))
    conn.commit()
    conn.close()
    return redirect(url_for("dashboard"))


def _guardar_cliente(cliente_id=None):
    datos = (
        request.form["nombre"],
        request.form["contacto"],
        request.form["plan"],
        request.form["fecha_renovacion"],
        request.form["ultima_interaccion"],
        int(request.form.get("tickets_abiertos") or 0),
        request.form.get("notas", ""),
    )
    conn = get_db()
    if cliente_id:
        conn.execute(
            """UPDATE clientes SET nombre=?, contacto=?, plan=?, fecha_renovacion=?,
               ultima_interaccion=?, tickets_abiertos=?, notas=? WHERE id=?""",
            (*datos, cliente_id),
        )
    else:
        conn.execute(
            """INSERT INTO clientes
               (nombre, contacto, plan, fecha_renovacion, ultima_interaccion, tickets_abiertos, notas)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            datos,
        )
    conn.commit()
    conn.close()


init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
