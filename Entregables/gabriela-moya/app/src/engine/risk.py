"""Risk Engine — calculates risk scores with contextual modifiers."""

from typing import List, Dict, Any

from engine.models import Assessment


def calculate_risks(
    findings: List[Dict[str, Any]],
    assessment: Assessment,
) -> List[Dict[str, Any]]:
    """
    Apply contextual modifiers to each finding and compute risk scores.

    Modifiers:
    - Internet exposure: +1 likelihood (only for threats on internet-exposed components)
    - High/Critical criticality: +1 impact
    - Sensitive data + confidentiality/integrity threat: +1 impact

    All values capped at 5.

    Returns findings enriched with a 'risk' sub-dict.
    """
    results = []

    for finding in findings:
        likelihood = finding["base_likelihood"]
        impact = finding["base_impact"]
        likelihood_mods = []
        impact_mods = []

        component_type = finding["component"]
        comp = assessment.get_component(component_type)

        # Modifier 1: Internet exposure increases likelihood
        # Only apply if the specific component is internet-exposed
        if comp and comp.get("internet_exposed"):
            likelihood = min(5, likelihood + 1)
            likelihood_mods.append("Componente expuesto a Internet (+1)")

        # Modifier 2: High/Critical criticality increases impact
        if assessment.context.criticality in ("high", "critical"):
            impact = min(5, impact + 1)
            impact_mods.append(f"Criticidad {assessment.context.criticality} (+1)")

        # Modifier 3: Sensitive data + confidentiality/integrity threat
        stride_cat = finding["stride"]
        confidentiality_threats = ("Information Disclosure", "Tampering")
        has_sensitive = (
            assessment.context.sensitive_data
            or (comp and comp.get("handles_sensitive_data"))
        )
        if has_sensitive and stride_cat in confidentiality_threats:
            impact = min(5, impact + 1)
            impact_mods.append("Datos sensibles + amenaza de confidencialidad/integridad (+1)")

        score = likelihood * impact
        level = classify_risk(score)

        risk_result = dict(finding)
        risk_result["risk"] = {
            "base_likelihood": finding["base_likelihood"],
            "likelihood_modifiers": likelihood_mods,
            "final_likelihood": likelihood,
            "base_impact": finding["base_impact"],
            "impact_modifiers": impact_mods,
            "final_impact": impact,
            "score": score,
            "level": level,
        }
        results.append(risk_result)

    return results


def classify_risk(score: int) -> str:
    """Classify risk score into a level string."""
    if score <= 5:
        return "low"
    elif score <= 10:
        return "medium"
    elif score <= 15:
        return "high"
    else:
        return "critical"
