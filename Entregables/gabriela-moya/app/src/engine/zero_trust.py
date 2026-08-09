"""Zero Trust Engine — preliminary alignment evaluation across 5 dimensions."""

from typing import List, Dict, Any
from engine.models import Assessment


def evaluate_zero_trust(assessment: Assessment) -> Dict[str, Any]:
    """
    Evaluate preliminary Zero Trust alignment across 5 dimensions.

    Returns a report with per-dimension results and overall summary.
    This is NOT a certification — it's an orientative preliminary assessment.
    """
    dimensions = [
        evaluate_identity(assessment),
        evaluate_access(assessment),
        evaluate_data_protection(assessment),
        evaluate_segmentation(assessment),
        evaluate_visibility(assessment),
    ]

    # Calculate overall percentage (orientative)
    score_map = {"cumple": 100, "parcial": 50, "brecha": 0}
    total = sum(score_map.get(d["alignment"], 0) for d in dimensions)
    overall_pct = total // len(dimensions)

    return {
        "dimensions": dimensions,
        "overall_percentage": overall_pct,
        "overall_label": _overall_label(overall_pct),
    }


def _overall_label(pct: int) -> str:
    if pct >= 80:
        return "Alto alineamiento"
    elif pct >= 50:
        return "Alineamiento parcial"
    else:
        return "Alineamiento insuficiente"


def evaluate_identity(assessment: Assessment) -> Dict[str, Any]:
    """Identity: verify all exposed components authenticate actors."""
    checks = []

    # Check 1: Exposed components have authentication
    exposed = []
    authenticated = []
    for comp in assessment.components:
        if comp.get("internet_exposed"):
            exposed.append(comp.component_type)
            if comp.get("has_authentication"):
                authenticated.append(comp.component_type)

    if not exposed:
        checks.append({
            "id": "zt-id-01",
            "description": "Componentes expuestos a Internet requieren autenticación",
            "status": "cumple",
            "evidence": "No hay componentes expuestos a Internet.",
        })
    elif len(authenticated) == len(exposed):
        checks.append({
            "id": "zt-id-01",
            "description": "Componentes expuestos a Internet requieren autenticación",
            "status": "cumple",
            "evidence": f"Todos los componentes expuestos ({', '.join(exposed)}) tienen autenticación.",
        })
    elif authenticated:
        checks.append({
            "id": "zt-id-01",
            "description": "Componentes expuestos a Internet requieren autenticación",
            "status": "parcial",
            "evidence": f"Expuestos: {', '.join(exposed)}. Con auth: {', '.join(authenticated)}.",
        })
    else:
        checks.append({
            "id": "zt-id-01",
            "description": "Componentes expuestos a Internet requieren autenticación",
            "status": "brecha",
            "evidence": f"Ningún componente expuesto ({', '.join(exposed)}) tiene autenticación.",
        })

    # Check 2: External systems authenticate
    ext = assessment.get_component("external_system")
    if ext:
        if ext.get("has_authentication"):
            checks.append({
                "id": "zt-id-02",
                "description": "Integraciones externas verifican identidad",
                "status": "cumple",
                "evidence": "External system requiere autenticación.",
            })
        else:
            checks.append({
                "id": "zt-id-02",
                "description": "Integraciones externas verifican identidad",
                "status": "brecha",
                "evidence": "External system no requiere autenticación.",
            })

    return _build_dimension_result("Identity", checks)


def evaluate_access(assessment: Assessment) -> Dict[str, Any]:
    """Access / Least Privilege: authorization and minimal permissions."""
    checks = []

    # Check 1: API has authorization if authenticated
    api = assessment.get_component("api")
    if api and api.get("has_authentication"):
        if api.get("has_authorization"):
            checks.append({
                "id": "zt-ac-01",
                "description": "APIs con autenticación implementan autorización granular",
                "status": "cumple",
                "evidence": "API tiene autenticación y autorización por roles/scopes.",
            })
        else:
            checks.append({
                "id": "zt-ac-01",
                "description": "APIs con autenticación implementan autorización granular",
                "status": "brecha",
                "evidence": "API tiene autenticación pero NO autorización granular.",
            })

    # Check 2: Least privilege
    if assessment.general_controls.has_least_privilege:
        checks.append({
            "id": "zt-ac-02",
            "description": "Se aplican permisos de mínimo privilegio",
            "status": "cumple",
            "evidence": "Mínimo privilegio declarado.",
        })
    else:
        checks.append({
            "id": "zt-ac-02",
            "description": "Se aplican permisos de mínimo privilegio",
            "status": "brecha",
            "evidence": "No se aplica mínimo privilegio.",
        })

    # Check 3: No shared credentials
    if not assessment.general_controls.has_shared_credentials:
        checks.append({
            "id": "zt-ac-03",
            "description": "No existen credenciales compartidas",
            "status": "cumple",
            "evidence": "No se reportan credenciales compartidas.",
        })
    else:
        checks.append({
            "id": "zt-ac-03",
            "description": "No existen credenciales compartidas",
            "status": "brecha",
            "evidence": "Existen credenciales compartidas.",
        })

    return _build_dimension_result("Access / Least Privilege", checks)


def evaluate_data_protection(assessment: Assessment) -> Dict[str, Any]:
    """Data Protection: encryption at rest and in transit."""
    checks = []

    # Check 1: Sensitive data encrypted at rest
    stores_with_sensitive = []
    stores_encrypted = []
    for comp in assessment.components:
        if comp.component_type in ("database", "files_storage", "queue_messaging"):
            if comp.get("handles_sensitive_data"):
                stores_with_sensitive.append(comp.component_type)
                if comp.get("has_encryption_at_rest"):
                    stores_encrypted.append(comp.component_type)

    if not stores_with_sensitive:
        checks.append({
            "id": "zt-dp-01",
            "description": "Datos sensibles cifrados en reposo",
            "status": "cumple",
            "evidence": "No hay almacenes con datos sensibles declarados.",
        })
    elif len(stores_encrypted) == len(stores_with_sensitive):
        checks.append({
            "id": "zt-dp-01",
            "description": "Datos sensibles cifrados en reposo",
            "status": "cumple",
            "evidence": f"Todos los stores sensibles cifrados: {', '.join(stores_encrypted)}.",
        })
    elif stores_encrypted:
        checks.append({
            "id": "zt-dp-01",
            "description": "Datos sensibles cifrados en reposo",
            "status": "parcial",
            "evidence": f"Sensibles: {', '.join(stores_with_sensitive)}. Cifrados: {', '.join(stores_encrypted)}.",
        })
    else:
        checks.append({
            "id": "zt-dp-01",
            "description": "Datos sensibles cifrados en reposo",
            "status": "brecha",
            "evidence": f"Ningún store sensible cifrado: {', '.join(stores_with_sensitive)}.",
        })

    # Check 2: Communications encrypted (TLS)
    comps_with_tls_prop = []
    comps_with_tls = []
    for comp in assessment.components:
        if "has_encryption_in_transit" in comp.properties:
            comps_with_tls_prop.append(comp.component_type)
            if comp.get("has_encryption_in_transit"):
                comps_with_tls.append(comp.component_type)

    if not comps_with_tls_prop:
        checks.append({
            "id": "zt-dp-02",
            "description": "Comunicaciones utilizan cifrado en tránsito",
            "status": "cumple",
            "evidence": "No hay componentes con propiedad de cifrado en tránsito declarada.",
        })
    elif len(comps_with_tls) == len(comps_with_tls_prop):
        checks.append({
            "id": "zt-dp-02",
            "description": "Comunicaciones utilizan cifrado en tránsito",
            "status": "cumple",
            "evidence": f"Todos los componentes usan TLS: {', '.join(comps_with_tls)}.",
        })
    elif comps_with_tls:
        checks.append({
            "id": "zt-dp-02",
            "description": "Comunicaciones utilizan cifrado en tránsito",
            "status": "parcial",
            "evidence": f"Con TLS: {', '.join(comps_with_tls)} de {', '.join(comps_with_tls_prop)}.",
        })
    else:
        checks.append({
            "id": "zt-dp-02",
            "description": "Comunicaciones utilizan cifrado en tránsito",
            "status": "brecha",
            "evidence": f"Ningún componente usa TLS.",
        })

    return _build_dimension_result("Data Protection", checks)


def evaluate_segmentation(assessment: Assessment) -> Dict[str, Any]:
    """Segmentation / Communications: network exposure control."""
    checks = []

    # Check 1: Databases not publicly accessible
    db = assessment.get_component("database")
    if db:
        if not db.get("internet_exposed"):
            checks.append({
                "id": "zt-sg-01",
                "description": "Bases de datos no son accesibles públicamente",
                "status": "cumple",
                "evidence": "Base de datos no está expuesta a Internet.",
            })
        else:
            checks.append({
                "id": "zt-sg-01",
                "description": "Bases de datos no son accesibles públicamente",
                "status": "brecha",
                "evidence": "Base de datos accesible públicamente.",
            })

    # Check 2: Storage not public
    fs = assessment.get_component("files_storage")
    if fs:
        if not fs.get("internet_exposed"):
            checks.append({
                "id": "zt-sg-02",
                "description": "Storage no tiene acceso público innecesario",
                "status": "cumple",
                "evidence": "Files/Storage no está expuesto públicamente.",
            })
        else:
            checks.append({
                "id": "zt-sg-02",
                "description": "Storage no tiene acceso público innecesario",
                "status": "brecha",
                "evidence": "Files/Storage tiene acceso público.",
            })

    # If no DB or storage, segmentation is fine by default
    if not checks:
        checks.append({
            "id": "zt-sg-01",
            "description": "Segmentación de componentes internos",
            "status": "cumple",
            "evidence": "No hay stores/DBs que evaluar para exposición pública.",
        })

    return _build_dimension_result("Segmentation / Communications", checks)


def evaluate_visibility(assessment: Assessment) -> Dict[str, Any]:
    """Visibility / Traceability: logging and audit."""
    checks = []

    if assessment.general_controls.has_security_logs:
        checks.append({
            "id": "zt-vs-01",
            "description": "Existen logs de seguridad",
            "status": "cumple",
            "evidence": "Security logs declarados.",
        })
    else:
        checks.append({
            "id": "zt-vs-01",
            "description": "Existen logs de seguridad",
            "status": "brecha",
            "evidence": "No existen logs de seguridad.",
        })

    if assessment.general_controls.has_audit_trail:
        checks.append({
            "id": "zt-vs-02",
            "description": "Acciones administrativas son trazables",
            "status": "cumple",
            "evidence": "Audit trail declarado.",
        })
    else:
        checks.append({
            "id": "zt-vs-02",
            "description": "Acciones administrativas son trazables",
            "status": "brecha",
            "evidence": "No existe trazabilidad de acciones administrativas.",
        })

    return _build_dimension_result("Visibility / Traceability", checks)


def _build_dimension_result(name: str, checks: List[Dict]) -> Dict[str, Any]:
    """Derive alignment from individual checks."""
    if not checks:
        return {"name": name, "alignment": "cumple", "checks": [], "gaps": []}

    statuses = [c["status"] for c in checks]
    gaps = [c for c in checks if c["status"] == "brecha"]

    if all(s == "cumple" for s in statuses):
        alignment = "cumple"
    elif any(s == "brecha" for s in statuses):
        alignment = "brecha"
    else:
        alignment = "parcial"

    return {
        "name": name,
        "alignment": alignment,
        "checks": checks,
        "gaps": gaps,
    }
