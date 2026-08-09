"""Threat Analysis Lambda — STRIDE rule matching.

Input:  { "assessment": { ... canonical Assessment dict ... } }
Output: { "findings": [ ... raw threat findings ... ] }

Does NOT calculate risk, evaluate ZT, or persist.
"""

from engine.models import assessment_from_dict
from engine.rules import load_rules, evaluate_threats


# Load rules once (Lambda container reuse)
_RULES = None


def _get_rules():
    global _RULES
    if _RULES is None:
        _RULES = load_rules()
    return _RULES


def handler(event: dict, context=None) -> dict:
    """
    Lambda handler for STRIDE threat analysis.

    Args:
        event: { "assessment": dict }
        context: Lambda context (unused)

    Returns:
        { "findings": list[dict] } — raw STRIDE findings without risk scores
    """
    assessment_data = event.get("assessment")
    if not assessment_data:
        raise ValueError("assessment is required in event.")

    assessment = assessment_from_dict(assessment_data)

    rules = _get_rules()
    findings = evaluate_threats(assessment, rules)

    return {
        "findings": findings,
    }
