"""Validate Lambda — validates and normalizes raw assessment input.

Input:  { "assessment_data": { ... raw dict from frontend ... } }
Output: { "assessment": { ... validated & normalized Assessment dict ... } }

Raises ValidationError if input is invalid.
Does NOT persist, generate IDs, or invoke other Lambdas.
"""

from engine.contracts import validate_assessment_input
from engine.models import parse_session_to_assessment, assessment_to_dict
from engine.exceptions import ValidationError


def handler(event: dict, context=None) -> dict:
    """
    Lambda handler for assessment validation.

    Args:
        event: { "assessment_data": dict }
        context: Lambda context (unused)

    Returns:
        { "assessment": dict } — normalized, JSON-serializable Assessment

    Raises:
        ValidationError: if input fails validation
    """
    assessment_data = event.get("assessment_data")
    if not assessment_data:
        raise ValidationError(["assessment_data is required."])

    # Validate against canonical contract
    errors = validate_assessment_input(assessment_data)
    if errors:
        raise ValidationError(errors)

    # Parse and normalize (input comes from frontend in session format)
    assessment = parse_session_to_assessment(assessment_data)

    # Return as canonical JSON-serializable dict
    return {
        "assessment": assessment_to_dict(assessment),
    }
