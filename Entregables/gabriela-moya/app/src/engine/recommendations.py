"""Recommendation resolution — maps control_ids to AWS controls catalog."""

import json
import os
from typing import List, Dict, Any


def load_controls(filepath: str = None) -> Dict[str, Any]:
    """Load AWS controls catalog from JSON file."""
    if filepath is None:
        data_dir = os.environ.get("DATA_DIR",
                                  os.path.join(os.path.dirname(__file__), "..", "..", "data"))
        filepath = os.path.join(data_dir, "aws_controls.json")

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def resolve_recommendations(
    findings: List[Dict[str, Any]],
    controls: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Resolve findings into recommendations by looking up control_ids.

    Groups by control_id to avoid repeating the same recommendation.
    Returns recommendations sorted by max risk score descending.
    """
    # Group findings by control_id
    control_groups: Dict[str, List[Dict]] = {}
    for f in findings:
        cid = f.get("control_id", "")
        if cid not in control_groups:
            control_groups[cid] = []
        control_groups[cid].append(f)

    recommendations = []
    for control_id, grouped_findings in control_groups.items():
        control = controls.get(control_id)

        # Calculate max risk for sorting
        max_score = max(f["risk"]["score"] for f in grouped_findings)
        max_level = max(
            grouped_findings,
            key=lambda f: {"critical": 4, "high": 3, "medium": 2, "low": 1}.get(f["risk"]["level"], 0)
        )["risk"]["level"]

        if control:
            rec = {
                "control_id": control_id,
                "requirement": control["requirement"],
                "control": control["control"],
                "aws_services": control["aws_services"],
                "explanation": control["explanation"],
                "reference": control["reference"],
                "max_risk_score": max_score,
                "max_risk_level": max_level,
                "related_findings": [
                    {
                        "rule_id": f["rule_id"],
                        "component": f["component"],
                        "stride": f["stride"],
                        "title": f["title"],
                        "risk_score": f["risk"]["score"],
                        "risk_level": f["risk"]["level"],
                    }
                    for f in grouped_findings
                ],
            }
        else:
            # Control not found in catalog — provide minimal info
            rec = {
                "control_id": control_id,
                "requirement": f"Control {control_id} no encontrado en catálogo.",
                "control": "Pendiente de definición",
                "aws_services": [],
                "explanation": "El control referenciado no está definido en aws_controls.json.",
                "reference": "",
                "max_risk_score": max_score,
                "max_risk_level": max_level,
                "related_findings": [
                    {
                        "rule_id": f["rule_id"],
                        "component": f["component"],
                        "stride": f["stride"],
                        "title": f["title"],
                        "risk_score": f["risk"]["score"],
                        "risk_level": f["risk"]["level"],
                    }
                    for f in grouped_findings
                ],
            }

        recommendations.append(rec)

    # Sort by max_risk_score descending
    recommendations.sort(key=lambda r: r["max_risk_score"], reverse=True)
    return recommendations
