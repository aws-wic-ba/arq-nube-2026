"""Risk Evaluation Lambda — risk scoring + Zero Trust + Gate + Recommendations.

Input:  { "assessment": dict, "findings": list }
Output: { "findings_with_risk": list, "zt_report": dict, "gate": dict, "recommendations": list }

Does NOT persist or generate visualization.
"""

from engine.models import assessment_from_dict
from engine.risk import calculate_risks
from engine.zero_trust import evaluate_zero_trust
from engine.gate import determine_gate
from engine.recommendations import load_controls, resolve_recommendations


# Load controls once (Lambda container reuse)
_CONTROLS = None


def _get_controls():
    global _CONTROLS
    if _CONTROLS is None:
        _CONTROLS = load_controls()
    return _CONTROLS


def handler(event: dict, context=None) -> dict:
    """
    Lambda handler for risk evaluation.

    Args:
        event: { "assessment": dict, "findings": list[dict] }
        context: Lambda context (unused)

    Returns:
        {
            "findings_with_risk": list[dict],
            "zt_report": dict,
            "gate": dict,
            "recommendations": list[dict]
        }
    """
    assessment_data = event.get("assessment")
    raw_findings = event.get("findings")

    if not assessment_data:
        raise ValueError("assessment is required in event.")
    if raw_findings is None:
        raise ValueError("findings is required in event.")

    assessment = assessment_from_dict(assessment_data)

    # Risk calculation
    findings_with_risk = calculate_risks(raw_findings, assessment)

    # Zero Trust alignment
    zt_report = evaluate_zero_trust(assessment)

    # Gate decision
    gate = determine_gate(findings_with_risk)

    # Recommendations
    controls = _get_controls()
    recommendations = resolve_recommendations(findings_with_risk, controls)

    return {
        "findings_with_risk": findings_with_risk,
        "zt_report": zt_report,
        "gate": gate,
        "recommendations": recommendations,
    }
