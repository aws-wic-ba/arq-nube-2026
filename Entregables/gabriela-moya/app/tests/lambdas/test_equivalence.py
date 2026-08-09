"""Equivalence test: pipeline A == lambda chain B.

Verifies that the original monolithic pipeline and the
new Lambda-based chain produce functionally equivalent results.
"""

import json

from engine.pipeline import run_analysis
from engine.rules import load_rules
from engine.recommendations import load_controls
from engine.contracts import result_to_dict

from lambdas.validate.handler import handler as validate_handler
from lambdas.threat_analysis.handler import handler as threat_handler
from lambdas.risk_evaluation.handler import handler as risk_handler
from lambdas.build_result.handler import handler as build_result_handler


API_PROVEEDORES_INPUT = {
    "context": {
        "solution_name": "API Proveedores",
        "description": "API para integracion con proveedores",
        "solution_type": "api",
        "criticality": "high",
        "internet_exposed": True,
        "external_users": True,
        "sensitive_data": True,
        "third_party": True,
    },
    "components": ["frontend", "api", "database", "external_system"],
    "properties": {
        "frontend": {"internet_exposed": True, "has_authentication": True, "has_encryption_in_transit": True},
        "api": {"internet_exposed": True, "has_authentication": True, "has_authorization": False,
                "has_rate_limiting": False, "has_input_validation": True, "has_encryption_in_transit": True},
        "database": {"handles_sensitive_data": True, "has_encryption_at_rest": False,
                     "internet_exposed": False, "has_backups": True},
        "external_system": {"has_encryption_in_transit": True, "has_authentication": True,
                            "has_secrets": True, "has_managed_secrets": False},
    },
    "general_controls": {
        "has_security_logs": True, "has_audit_trail": True, "has_shared_credentials": False,
        "has_least_privilege": True, "has_rto": False, "has_rpo": False,
    },
}


def run_lambda_chain(assessment_data: dict) -> dict:
    """Execute the 4 Lambda handlers in sequence, simulating Step Functions."""
    # 1. Validate
    v_out = validate_handler({"assessment_data": assessment_data})
    assessment = v_out["assessment"]

    # 2. Threat Analysis
    t_out = threat_handler({"assessment": assessment})
    findings = t_out["findings"]

    # 3. Risk Evaluation
    r_out = risk_handler({"assessment": assessment, "findings": findings})

    # 4. Build Result
    b_out = build_result_handler({
        "assessment": assessment,
        "findings_with_risk": r_out["findings_with_risk"],
        "zt_report": r_out["zt_report"],
        "gate": r_out["gate"],
        "recommendations": r_out["recommendations"],
    })

    return b_out["result"]


class TestPipelineEquivalence:
    """A == B: pipeline monolithic result equals lambda chain result."""

    def test_api_proveedores_equivalence(self):
        # A: Monolithic pipeline
        rules = load_rules()
        controls = load_controls()
        result_a = result_to_dict(run_analysis(API_PROVEEDORES_INPUT, rules, controls))

        # B: Lambda chain
        result_b = run_lambda_chain(API_PROVEEDORES_INPUT)

        # Compare key outputs
        assert result_a["gate"]["decision"] == result_b["gate"]["decision"]
        assert result_a["overall_risk"] == result_b["overall_risk"]
        assert result_a["risk_summary"] == result_b["risk_summary"]
        assert result_a["stride_summary"] == result_b["stride_summary"]
        assert len(result_a["findings"]) == len(result_b["findings"])
        assert len(result_a["recommendations"]) == len(result_b["recommendations"])
        assert len(result_a["viz_nodes"]) == len(result_b["viz_nodes"])

        # Compare ZT alignment
        zt_a = {d["name"]: d["alignment"] for d in result_a["zt_report"]["dimensions"]}
        zt_b = {d["name"]: d["alignment"] for d in result_b["zt_report"]["dimensions"]}
        assert zt_a == zt_b

        # Compare findings by rule_id
        findings_a = sorted(result_a["findings"], key=lambda f: f["rule_id"])
        findings_b = sorted(result_b["findings"], key=lambda f: f["rule_id"])
        for fa, fb in zip(findings_a, findings_b):
            assert fa["rule_id"] == fb["rule_id"]
            assert fa["stride"] == fb["stride"]
            assert fa["component"] == fb["component"]
            assert fa["risk"]["score"] == fb["risk"]["score"]
            assert fa["risk"]["level"] == fb["risk"]["level"]

    def test_both_json_serializable(self):
        rules = load_rules()
        controls = load_controls()
        result_a = result_to_dict(run_analysis(API_PROVEEDORES_INPUT, rules, controls))
        result_b = run_lambda_chain(API_PROVEEDORES_INPUT)

        json_a = json.dumps(result_a, ensure_ascii=False)
        json_b = json.dumps(result_b, ensure_ascii=False)
        assert len(json_a) > 0
        assert len(json_b) > 0
