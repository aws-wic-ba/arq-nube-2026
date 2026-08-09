"""Build Result Lambda — assembles canonical AssessmentResult.

Input:  { "assessment": dict, "findings_with_risk": list, "zt_report": dict,
          "gate": dict, "recommendations": list }
Output: { "result": { ...canonical AssessmentResult... } }

Does NOT persist. Step Functions handles persistence via DynamoDB integration.
"""

from engine.models import assessment_from_dict
from engine.result_builder import build_assessment_result


def handler(event: dict, context=None) -> dict:
    """
    Lambda handler for building the final AssessmentResult.

    Args:
        event: { assessment, findings_with_risk, zt_report, gate, recommendations }
        context: Lambda context (unused)

    Returns:
        { "result": dict } — canonical AssessmentResult, fully JSON-serializable
    """
    assessment_data = event.get("assessment")
    findings_with_risk = event.get("findings_with_risk")
    zt_report = event.get("zt_report")
    gate = event.get("gate")
    recommendations = event.get("recommendations")

    if not assessment_data:
        raise ValueError("assessment is required in event.")
    if findings_with_risk is None:
        raise ValueError("findings_with_risk is required in event.")
    if zt_report is None:
        raise ValueError("zt_report is required in event.")
    if gate is None:
        raise ValueError("gate is required in event.")
    if recommendations is None:
        raise ValueError("recommendations is required in event.")

    assessment = assessment_from_dict(assessment_data)

    result = build_assessment_result(
        assessment=assessment,
        findings_with_risk=findings_with_risk,
        zt_report=zt_report,
        gate=gate,
        recommendations=recommendations,
    )

    return {
        "result": result,
    }
