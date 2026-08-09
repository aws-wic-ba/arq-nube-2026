"""Canonical contracts for Assessment input and AssessmentResult output.

These contracts define the data structures exchanged between transport layers
(Flask, Lambda, tests, CLI) and the engine. They are framework-agnostic and
JSON-serializable.

The engine accepts a canonical Assessment dict and produces a canonical
AssessmentResult dict. Both are plain Python dicts that can be directly
serialized to/from JSON without custom encoders.

Transport adapters (Flask, Lambda) are responsible for:
1. Converting their native input format into the canonical Assessment dict
2. Passing it to the engine
3. Receiving the canonical AssessmentResult dict
4. Converting it to their native output format (HTML, API response, etc.)
"""

import dataclasses
from typing import Any, Dict, List

from engine.models import Assessment


# ===========================================================================
# INPUT CONTRACT: Assessment
# ===========================================================================
#
# The canonical input is a plain dict with this structure:
#
# {
#   "context": {
#     "solution_name": str (required),
#     "description": str (optional, default ""),
#     "solution_type": str (required: web_application|api|serverless|integration|data_pipeline|other),
#     "criticality": str (required: low|medium|high|critical),
#     "internet_exposed": bool (required),
#     "external_users": bool (required),
#     "sensitive_data": bool (required),
#     "third_party": bool (required)
#   },
#   "components": [str] (required, min 1: frontend|api|database|files_storage|queue_messaging|external_system),
#   "properties": {
#     "<component_type>": {
#       "<property_id>": bool
#     }
#   },
#   "general_controls": {
#     "has_security_logs": bool,
#     "has_audit_trail": bool,
#     "has_shared_credentials": bool,
#     "has_least_privilege": bool,
#     "has_rto": bool,
#     "has_rpo": bool
#   }
# }
#
# Notes:
# - "assessment_id" is NOT part of the engine input — it's a persistence concern
# - All boolean properties in "properties" must be explicitly true or false
# - The engine does not know about Flask session, Lambda event, or DynamoDB items

VALID_SOLUTION_TYPES = {"web_application", "api", "serverless", "integration", "data_pipeline", "other"}
VALID_CRITICALITIES = {"low", "medium", "high", "critical"}
VALID_COMPONENTS = {"frontend", "api", "database", "files_storage", "queue_messaging", "external_system"}


def validate_assessment_input(data: dict) -> List[str]:
    """
    Validate an assessment input dict against the canonical contract.

    Returns a list of error messages. Empty list means valid.
    """
    errors = []

    if not isinstance(data, dict):
        return ["Assessment must be a dict."]

    # Context
    ctx = data.get("context")
    if not ctx or not isinstance(ctx, dict):
        errors.append("context is required and must be a dict.")
    else:
        if not ctx.get("solution_name"):
            errors.append("context.solution_name is required.")
        if ctx.get("solution_type") not in VALID_SOLUTION_TYPES:
            errors.append(f"context.solution_type must be one of {VALID_SOLUTION_TYPES}.")
        if ctx.get("criticality") not in VALID_CRITICALITIES:
            errors.append(f"context.criticality must be one of {VALID_CRITICALITIES}.")
        for field in ("internet_exposed", "external_users", "sensitive_data", "third_party"):
            if not isinstance(ctx.get(field), bool):
                errors.append(f"context.{field} must be a boolean.")

    # Components
    components = data.get("components")
    if not components or not isinstance(components, list):
        errors.append("components is required and must be a non-empty list.")
    else:
        for c in components:
            if c not in VALID_COMPONENTS:
                errors.append(f"Invalid component: '{c}'. Must be one of {VALID_COMPONENTS}.")

    # Properties
    properties = data.get("properties")
    if not isinstance(properties, dict):
        errors.append("properties must be a dict.")

    # General controls
    gc = data.get("general_controls")
    if not isinstance(gc, dict):
        errors.append("general_controls must be a dict.")

    return errors


# ===========================================================================
# OUTPUT CONTRACT: AssessmentResult
# ===========================================================================
#
# The canonical output from run_analysis() is a dict with this structure:
#
# {
#   "assessment": Assessment (dataclass — use assessment_to_dict() for JSON),
#   "findings": [Finding],
#   "zt_report": ZeroTrustReport,
#   "gate": GateDecision,
#   "recommendations": [Recommendation],
#   "risk_summary": {"critical": int, "high": int, "medium": int, "low": int},
#   "stride_summary": {"Spoofing": int, ..., "Elevation of Privilege": int},
#   "overall_risk": str (critical|high|medium|low|none),
#   "viz_nodes": [VizNode]   ← PRESENTATION layer (not strictly domain)
# }
#
# Domain fields: assessment, findings, zt_report, gate, recommendations,
#                risk_summary, stride_summary, overall_risk
#
# Presentation fields: viz_nodes (used by frontend for rendering architecture diagram)
#
# All fields except "assessment" are already plain dicts/lists.
# "assessment" requires dataclasses.asdict() for JSON serialization.


def result_to_dict(result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert a run_analysis() result into a fully JSON-serializable dict.

    Handles the Assessment dataclass → dict conversion.
    All other fields are already plain dicts/lists.
    """
    output = dict(result)
    if dataclasses.is_dataclass(output.get("assessment")):
        output["assessment"] = dataclasses.asdict(output["assessment"])
    return output


def assessment_to_dict(assessment: Assessment) -> Dict[str, Any]:
    """Convert an Assessment dataclass to a plain dict."""
    return dataclasses.asdict(assessment)
