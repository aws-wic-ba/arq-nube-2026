"""
App web minima (2 paginas) que expone el motor de clasificacion
de identidades para la demo local con Docker.

Pagina 1 (/):            pegar/subir el JSON de Azure AD, procesar.
Pagina 2 (/resultados):  ver roles limpios vs. deprecados y el
                          reporte de compliance generado.

Nota: en esta demo local el paso de Jira se simula (no llama a la
API real) para no requerir credenciales en el contenedor. La
integracion real con Jira esta implementada y probada en la
version de linea de comandos del proyecto (fuera de este TP).
"""
import json

from flask import Flask, render_template, request, redirect, url_for

from engine import filter_roles, to_pam_provisioning_schema, build_compliance_report

app = Flask(__name__)

# Estado en memoria: alcanza para esta demo de un solo usuario.
# En la propuesta de arquitectura AWS (docs/03), este estado pasa
# a persistirse en DynamoDB + S3.
last_result = {}

SAMPLE_DATA = [
    {"user": "admin_old@bancor.com", "role": "GlobalAdmin", "role_type": "privileged",
     "last_login_days": 120, "mfa_enabled": False, "source": "Azure AD"},
    {"user": "analista_riesgo@bancor.com", "role": "RiskViewer", "role_type": "standard",
     "last_login_days": 5, "mfa_enabled": True, "source": "Azure AD"},
    {"user": "externo_dev@bancor.com", "role": "DataOwner", "role_type": "privileged",
     "last_login_days": 200, "mfa_enabled": False, "source": "Azure AD"},
    {"user": "soporte_nocturno@bancor.com", "role": "ServerAdmin", "role_type": "privileged",
     "last_login_days": 45, "mfa_enabled": True, "source": "Azure AD"},
    {"user": "pasante_2023@bancor.com", "role": "ReadOnlyAuditor", "role_type": "standard",
     "last_login_days": 300, "mfa_enabled": False, "source": "Azure AD"},
    {"user": "cajero_sucursal01@bancor.com", "role": "TellerApp", "role_type": "standard",
     "last_login_days": 1, "mfa_enabled": True, "source": "Azure AD"},
]


@app.route("/", methods=["GET"])
def index():
    sample_json = json.dumps(SAMPLE_DATA, indent=2, ensure_ascii=False)
    return render_template("index.html", sample_json=sample_json, error=None)


@app.route("/procesar", methods=["POST"])
def procesar():
    raw = request.form.get("azure_json", "")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        sample_json = json.dumps(SAMPLE_DATA, indent=2, ensure_ascii=False)
        return render_template(
            "index.html", sample_json=sample_json, error=f"JSON invalido: {e}"
        )

    clean, deprecated = filter_roles(data)
    pam_ready = to_pam_provisioning_schema(clean)

    # Simulacion del paso de Jira para la demo local (sin credenciales reales)
    jira_ticket_key = f"KAN-DEMO-{len(deprecated)}" if deprecated else None

    report = build_compliance_report(clean, deprecated, jira_ticket_key)

    global last_result
    last_result = {
        "clean": clean,
        "deprecated": deprecated,
        "pam_ready": pam_ready,
        "report": report,
    }
    return redirect(url_for("resultados"))


@app.route("/resultados", methods=["GET"])
def resultados():
    if not last_result:
        return redirect(url_for("index"))
    return render_template("resultados.html", **last_result)


@app.route("/healthz", methods=["GET"])
def healthz():
    return {"status": "ok"}, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
