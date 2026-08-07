"""
Motor de clasificacion de identidades y reporte de compliance.
Misma logica que el MVP original en linea de comandos, ahora
importada por la app web (Flask) en vez de correr por CLI.
"""
import datetime

DEPRECATION_THRESHOLDS = {
    "privileged": 30,
    "standard": 90,
}

COMPLIANCE_CONTEXT = {
    "ISO_27001_2022": [
        "A.5.15 - Access control",
        "A.5.18 - Access rights (review/removal)",
        "A.8.2 - Privileged access rights",
    ],
    "PCI_DSS_v4": [
        "Requirement 7 - Restrict access to system components by business need to know",
        "Requirement 8 - Identify users and authenticate access to system components",
    ],
}


def filter_roles(data: list) -> tuple:
    """Separa los roles en 'clean' (listos para AWS) y 'deprecated' (revision manual)."""
    clean = []
    deprecated = []

    for item in data:
        role_type = item.get("role_type", "standard")
        threshold = DEPRECATION_THRESHOLDS.get(role_type, DEPRECATION_THRESHOLDS["standard"])
        reasons = []

        if item.get("last_login_days", 0) > threshold:
            reasons.append(
                f"Inactivo hace {item['last_login_days']} dias (umbral {role_type}: {threshold})"
            )

        if role_type == "privileged" and not item.get("mfa_enabled", False):
            reasons.append("Rol privilegiado sin MFA habilitado")

        if reasons:
            flagged = dict(item)
            flagged["deprecation_reasons"] = reasons
            deprecated.append(flagged)
        else:
            clean.append(item)

    return clean, deprecated


def to_pam_provisioning_schema(clean: list) -> list:
    """Contrato de datos simplificado, pensado para ser consumido por un PAM en el futuro."""
    return [
        {
            "principal_id": item["user"],
            "target_role": item["role"],
            "criticality": item.get("role_type", "standard"),
            "mfa_enabled": item.get("mfa_enabled", False),
            "source_directory": item.get("source", "Azure AD"),
            "provisioning_status": "pending_pam_onboarding",
        }
        for item in clean
    ]


def build_compliance_report(clean: list, deprecated: list, jira_ticket_key: str = None) -> dict:
    """Genera el reporte de auditoria trazable de punta a punta."""
    return {
        "timestamp_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "compliance_context": COMPLIANCE_CONTEXT,
        "summary": {
            "total_evaluated": len(clean) + len(deprecated),
            "ready_for_aws_migration": len(clean),
            "flagged_for_manual_review": len(deprecated),
        },
        "deprecated_detail": [
            {"user": d["user"], "role": d["role"], "reasons": d["deprecation_reasons"]}
            for d in deprecated
        ],
        "jira_ticket": jira_ticket_key,
        "action_taken": (
            "Roles inactivos o de alto riesgo fueron escalados a Jira para "
            "revision manual. El script no elimina ni modifica accesos: "
            "la decision final queda en manos de un oficial de seguridad "
            "(segregacion de funciones)."
        ),
    }
