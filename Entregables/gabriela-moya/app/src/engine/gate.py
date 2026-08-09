"""Security Architecture Gate — deterministic decision from risk levels."""

from typing import List, Dict, Any


GATE_REQUIRES_REVIEW = "REQUIERE REVISIÓN DE ARQUITECTURA DE SEGURIDAD"
GATE_OBSERVATIONS = "APROBADO CON OBSERVACIONES"
GATE_APPROVED = "APROBADO"


def determine_gate(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Derive Security Architecture Gate from risk results.

    Decision table:
    - Any Critical risk OR >=2 High risks → REQUIRES REVIEW
    - Any Medium risk OR exactly 1 High risk → APPROVED WITH OBSERVATIONS
    - Only Low risks (or no risks) → APPROVED

    Returns dict with decision, reason, and summary.
    """
    if not findings:
        return {
            "decision": GATE_APPROVED,
            "css_class": "success",
            "reason": "No se identificaron amenazas en la arquitectura declarada.",
            "summary": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "next_action": "La arquitectura puede continuar al siguiente nivel de diseño.",
        }

    summary = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        level = f["risk"]["level"]
        summary[level] = summary.get(level, 0) + 1

    # Decision logic
    if summary["critical"] > 0 or summary["high"] >= 2:
        reasons = []
        if summary["critical"] > 0:
            reasons.append(f"{summary['critical']} riesgo(s) crítico(s)")
        if summary["high"] >= 2:
            reasons.append(f"{summary['high']} riesgos altos")
        return {
            "decision": GATE_REQUIRES_REVIEW,
            "css_class": "danger",
            "reason": f"Se detectaron: {'; '.join(reasons)}.",
            "summary": summary,
            "next_action": "Los riesgos identificados requieren revisión especializada antes de continuar con la implementación.",
        }
    elif summary["medium"] > 0 or summary["high"] == 1:
        reasons = []
        if summary["high"] == 1:
            reasons.append("1 riesgo alto")
        if summary["medium"] > 0:
            reasons.append(f"{summary['medium']} riesgo(s) medio(s)")
        return {
            "decision": GATE_OBSERVATIONS,
            "css_class": "warning",
            "reason": f"Se detectaron: {'; '.join(reasons)}.",
            "summary": summary,
            "next_action": "La arquitectura puede avanzar incorporando los controles identificados.",
        }
    else:
        return {
            "decision": GATE_APPROVED,
            "css_class": "success",
            "reason": "Solo se identificaron riesgos de nivel bajo.",
            "summary": summary,
            "next_action": "La arquitectura puede continuar al siguiente nivel de diseño.",
        }
