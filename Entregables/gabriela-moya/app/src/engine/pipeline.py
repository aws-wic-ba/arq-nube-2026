"""Assessment analysis pipeline — framework-agnostic orchestration.

This module encapsulates the complete analysis workflow:
    Assessment dict → Validate → STRIDE → Risk → Zero Trust → Gate → Recommendations → Result

It can be invoked from:
- Flask (local/Docker) via app.py
- AWS Lambda handlers (future)
- Tests directly

No dependency on Flask, HTTP, sessions, or templates.
"""

from typing import Dict, Any, List

from engine.models import Assessment, parse_session_to_assessment
from engine.rules import load_rules, evaluate_threats
from engine.risk import calculate_risks
from engine.zero_trust import evaluate_zero_trust
from engine.recommendations import load_controls, resolve_recommendations
from engine.gate import determine_gate
from engine.result_builder import build_assessment_result


def run_analysis(assessment_data: dict, rules: List[Dict], controls: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute the full analysis pipeline on an assessment dict.

    Args:
        assessment_data: Raw assessment dict (same structure as session['assessment'])
        rules: Pre-loaded threat rules (list of dicts)
        controls: Pre-loaded AWS controls catalog (dict keyed by control_id)

    Returns:
        Complete analysis result dict containing:
        - assessment: The parsed Assessment object
        - findings: List of findings with risk scores
        - zt_report: Zero Trust alignment report
        - gate: Security Architecture Gate decision
        - recommendations: Resolved AWS recommendations
        - risk_summary: Counts per risk level
        - stride_summary: Counts per STRIDE category
        - overall_risk: Highest risk level found
        - viz_nodes: Visualization data
    """
    # 1. Parse and validate
    assessment = parse_session_to_assessment(assessment_data)

    # 2. Threat Modeling (STRIDE)
    raw_findings = evaluate_threats(assessment, rules)

    # 3. Risk Calculation
    findings = calculate_risks(raw_findings, assessment)

    # 4. Zero Trust Alignment
    zt_report = evaluate_zero_trust(assessment)

    # 5. Security Architecture Gate
    gate = determine_gate(findings)

    # 6. Recommendations
    recommendations = resolve_recommendations(findings, controls)

    # 7. Build canonical AssessmentResult
    return build_assessment_result(
        assessment=assessment,
        findings_with_risk=findings,
        zt_report=zt_report,
        gate=gate,
        recommendations=recommendations,
    )
