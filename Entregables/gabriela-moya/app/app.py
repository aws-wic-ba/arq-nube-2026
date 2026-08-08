"""Secure Design Advisor — Security by Design for Cloud Architects."""

import os
from flask import Flask, render_template, request, session, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", os.urandom(32))

# Component definitions for the wizard
COMPONENT_CATALOG = {
    "frontend": {
        "label": "Frontend",
        "icon": "&#9741;",
        "description": "Interfaz web o móvil accesible por usuarios."
    },
    "api": {
        "label": "API",
        "icon": "&#8644;",
        "description": "Endpoints REST, GraphQL o servicios backend."
    },
    "database": {
        "label": "Database",
        "icon": "&#9707;",
        "description": "Base de datos relacional o NoSQL."
    },
    "files_storage": {
        "label": "Files / Object Storage",
        "icon": "&#9776;",
        "description": "Almacenamiento de archivos, blobs u objetos."
    },
    "queue_messaging": {
        "label": "Queue / Messaging",
        "icon": "&#8651;",
        "description": "Colas de mensajes o event streaming."
    },
    "external_system": {
        "label": "External System",
        "icon": "&#9729;",
        "description": "Integración con sistema o servicio de terceros."
    },
}

# Per-component property definitions
COMPONENT_PROPERTIES = {
    "frontend": [
        {"id": "internet_exposed", "label": "¿Es accesible desde Internet?"},
        {"id": "has_authentication", "label": "¿Requiere autenticación?"},
        {"id": "has_encryption_in_transit", "label": "¿Utiliza HTTPS?"},
    ],
    "api": [
        {"id": "internet_exposed", "label": "¿Es pública (accesible desde Internet)?"},
        {"id": "has_authentication", "label": "¿Requiere autenticación?"},
        {"id": "has_authorization", "label": "¿Tiene autorización por roles/scopes?"},
        {"id": "has_rate_limiting", "label": "¿Tiene rate limiting?"},
        {"id": "has_input_validation", "label": "¿Valida inputs/payloads?"},
        {"id": "has_encryption_in_transit", "label": "¿Utiliza HTTPS/TLS?"},
    ],
    "database": [
        {"id": "handles_sensitive_data", "label": "¿Contiene datos sensibles?"},
        {"id": "has_encryption_at_rest", "label": "¿Está cifrada en reposo?"},
        {"id": "internet_exposed", "label": "¿Es accesible públicamente?"},
        {"id": "has_backups", "label": "¿Tiene backups configurados?"},
    ],
    "files_storage": [
        {"id": "handles_sensitive_data", "label": "¿Contiene datos sensibles?"},
        {"id": "has_encryption_at_rest", "label": "¿Está cifrado en reposo?"},
        {"id": "internet_exposed", "label": "¿Permite acceso público?"},
        {"id": "has_backups", "label": "¿Tiene versionado o respaldo?"},
    ],
    "queue_messaging": [
        {"id": "handles_sensitive_data", "label": "¿Transporta datos sensibles?"},
        {"id": "has_encryption_in_transit", "label": "¿Está cifrada?"},
        {"id": "has_authentication", "label": "¿Productores/consumidores se autentican?"},
    ],
    "external_system": [
        {"id": "has_encryption_in_transit", "label": "¿La comunicación utiliza TLS?"},
        {"id": "has_authentication", "label": "¿El sistema externo se autentica?"},
        {"id": "has_secrets", "label": "¿La integración utiliza secretos o credenciales?"},
        {"id": "has_managed_secrets", "label": "Si usa secretos: ¿se gestionan mediante un mecanismo centralizado?"},
    ],
}

GENERAL_CONTROLS = [
    {"id": "has_security_logs", "label": "¿Existen logs de seguridad?"},
    {"id": "has_audit_trail", "label": "¿Las acciones administrativas son trazables?"},
    {"id": "has_shared_credentials", "label": "¿Existen cuentas o credenciales compartidas?"},
    {"id": "has_least_privilege", "label": "¿Se aplican permisos de mínimo privilegio?"},
    {"id": "has_rto", "label": "¿Existe RTO definido?"},
    {"id": "has_rpo", "label": "¿Existe RPO definido?"},
]

SOLUTION_TYPES = [
    {"id": "web_application", "label": "Web Application"},
    {"id": "api", "label": "API"},
    {"id": "serverless", "label": "Serverless"},
    {"id": "integration", "label": "Integration"},
    {"id": "data_pipeline", "label": "Data Pipeline"},
    {"id": "other", "label": "Other"},
]

CRITICALITY_LEVELS = [
    {"id": "low", "label": "Baja", "description": "Impacto limitado si no está disponible."},
    {"id": "medium", "label": "Media", "description": "Afecta operaciones pero hay alternativas."},
    {"id": "high", "label": "Alta", "description": "Impacta directamente al negocio o usuarios."},
    {"id": "critical", "label": "Crítica", "description": "Pérdida grave si falla; sin alternativa inmediata."},
]


@app.route("/")
def index():
    """Render the landing page."""
    return render_template("index.html")


@app.route("/assessment/new")
def new_assessment():
    """Clear session and start a new assessment at Step 1."""
    session.pop("assessment", None)
    return redirect(url_for("step_context"))


@app.route("/assessment/context", methods=["GET", "POST"])
def step_context():
    """Step 1: Solution context."""
    if request.method == "POST":
        name = request.form.get("solution_name", "").strip()
        solution_type = request.form.get("solution_type", "").strip()
        criticality = request.form.get("criticality", "").strip()
        description = request.form.get("description", "").strip()
        internet_exposed = request.form.get("internet_exposed") == "yes"
        external_users = request.form.get("external_users") == "yes"
        sensitive_data = request.form.get("sensitive_data") == "yes"
        third_party = request.form.get("third_party") == "yes"

        errors = []
        if not name:
            errors.append("El nombre de la solución es obligatorio.")
        if not solution_type:
            errors.append("Seleccioná un tipo de solución.")
        if not criticality:
            errors.append("Seleccioná un nivel de criticidad.")

        if errors:
            return render_template(
                "wizard/context.html",
                errors=errors,
                form=request.form,
                solution_types=SOLUTION_TYPES,
                criticality_levels=CRITICALITY_LEVELS,
            )

        # Store in session
        session["assessment"] = {
            "context": {
                "solution_name": name,
                "description": description,
                "solution_type": solution_type,
                "criticality": criticality,
                "internet_exposed": internet_exposed,
                "external_users": external_users,
                "sensitive_data": sensitive_data,
                "third_party": third_party,
            }
        }
        return redirect(url_for("step_components"))

    # GET — render form, pre-fill if returning
    assessment = session.get("assessment", {})
    form_data = assessment.get("context", {})
    return render_template(
        "wizard/context.html",
        errors=[],
        form=form_data,
        solution_types=SOLUTION_TYPES,
        criticality_levels=CRITICALITY_LEVELS,
    )


@app.route("/assessment/components", methods=["GET", "POST"])
def step_components():
    """Step 2: Component selection."""
    assessment = session.get("assessment")
    if not assessment or "context" not in assessment:
        flash("Iniciá una nueva evaluación primero.", "warning")
        return redirect(url_for("index"))

    if request.method == "POST":
        selected = request.form.getlist("components")

        if not selected:
            return render_template(
                "wizard/components.html",
                errors=["Seleccioná al menos un componente."],
                components=COMPONENT_CATALOG,
                selected=selected,
            )

        assessment["components"] = selected
        session["assessment"] = assessment
        return redirect(url_for("step_properties"))

    selected = assessment.get("components", [])
    return render_template(
        "wizard/components.html",
        errors=[],
        components=COMPONENT_CATALOG,
        selected=selected,
    )


@app.route("/assessment/properties", methods=["GET", "POST"])
def step_properties():
    """Step 3: Per-component properties and general controls."""
    assessment = session.get("assessment")
    if not assessment or "components" not in assessment:
        flash("Iniciá una nueva evaluación primero.", "warning")
        return redirect(url_for("index"))

    selected_components = assessment["components"]

    if request.method == "POST":
        properties = {}
        for comp in selected_components:
            comp_props = {}
            for prop in COMPONENT_PROPERTIES.get(comp, []):
                comp_props[prop["id"]] = request.form.get(f"{comp}__{prop['id']}") == "yes"
            properties[comp] = comp_props

        general_controls = {}
        for ctrl in GENERAL_CONTROLS:
            general_controls[ctrl["id"]] = request.form.get(f"general__{ctrl['id']}") == "yes"

        assessment["properties"] = properties
        assessment["general_controls"] = general_controls
        session["assessment"] = assessment
        return redirect(url_for("step_review"))

    # GET — pre-fill if returning
    existing_props = assessment.get("properties", {})
    existing_general = assessment.get("general_controls", {})
    return render_template(
        "wizard/properties.html",
        errors=[],
        selected_components=selected_components,
        component_catalog=COMPONENT_CATALOG,
        component_properties=COMPONENT_PROPERTIES,
        general_controls=GENERAL_CONTROLS,
        existing_props=existing_props,
        existing_general=existing_general,
    )


@app.route("/assessment/review")
def step_review():
    """Step 4: Review all captured data before analysis."""
    assessment = session.get("assessment")
    if not assessment or "properties" not in assessment:
        flash("Iniciá una nueva evaluación primero.", "warning")
        return redirect(url_for("index"))

    context = assessment["context"]
    components = assessment["components"]
    properties = assessment["properties"]
    general_controls = assessment["general_controls"]

    # Resolve labels for display
    type_label = next(
        (t["label"] for t in SOLUTION_TYPES if t["id"] == context.get("solution_type")),
        context.get("solution_type", ""),
    )
    crit_label = next(
        (c["label"] for c in CRITICALITY_LEVELS if c["id"] == context.get("criticality")),
        context.get("criticality", ""),
    )

    return render_template(
        "wizard/review.html",
        context=context,
        type_label=type_label,
        crit_label=crit_label,
        components=components,
        component_catalog=COMPONENT_CATALOG,
        properties=properties,
        component_properties=COMPONENT_PROPERTIES,
        general_controls=general_controls,
        general_controls_def=GENERAL_CONTROLS,
    )


@app.route("/assessment/analyze", methods=["POST"])
def analyze():
    """Placeholder for analysis — engine not yet implemented."""
    return render_template("wizard/analyze_pending.html")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
