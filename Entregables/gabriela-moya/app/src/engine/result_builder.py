"""Result builder — constructs the canonical AssessmentResult from analysis outputs.

Shared between pipeline.py and Build Result Lambda.
No framework dependencies.
"""

import dataclasses
from typing import Dict, Any, List

from engine.models import Assessment
from engine.visualization import build_visualization


def build_assessment_result(
    assessment: Assessment,
    findings_with_risk: List[Dict[str, Any]],
    zt_report: Dict[str, Any],
    gate: Dict[str, Any],
    recommendations: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Construct the canonical AssessmentResult from analysis outputs.

    This produces the same structure as run_analysis() but from pre-computed parts.
    Output is fully JSON-serializable.
    """
    risk_summary = compute_risk_summary(findings_with_risk)
    stride_summary = compute_stride_summary(findings_with_risk)
    overall_risk = compute_overall_risk(risk_summary)
    viz_nodes = build_visualization(assessment, findings_with_risk)

    return {
        "assessment": dataclasses.asdict(assessment) if dataclasses.is_dataclass(assessment) else assessment,
        "findings": findings_with_risk,
        "zt_report": zt_report,
        "gate": gate,
        "recommendations": recommendations,
        "risk_summary": risk_summary,
        "stride_summary": stride_summary,
        "overall_risk": overall_risk,
        "viz_nodes": viz_nodes,
    }


def compute_risk_summary(findings: List[Dict[str, Any]]) -> Dict[str, int]:
    """Count findings per risk level."""
    summary = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        level = f.get("risk", {}).get("level", "low")
        summary[level] = summary.get(level, 0) + 1
    return summary


def compute_stride_summary(findings: List[Dict[str, Any]]) -> Dict[str, int]:
    """Count findings per STRIDE category."""
    categories = [
        "Spoofing", "Tampering", "Repudiation",
        "Information Disclosure", "Denial of Service", "Elevation of Privilege",
    ]
    summary = {cat: 0 for cat in categories}
    for f in findings:
        cat = f.get("stride", "")
        if cat in summary:
            summary[cat] += 1
    return summary


def compute_overall_risk(risk_summary: Dict[str, int]) -> str:
    """Derive overall risk level from summary counts."""
    if risk_summary.get("critical", 0) > 0:
        return "critical"
    elif risk_summary.get("high", 0) > 0:
        return "high"
    elif risk_summary.get("medium", 0) > 0:
        return "medium"
    elif risk_summary.get("low", 0) > 0:
        return "low"
    return "none"
