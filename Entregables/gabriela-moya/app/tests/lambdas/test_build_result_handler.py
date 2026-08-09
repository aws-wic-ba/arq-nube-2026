"""Tests for Build Result Lambda handler."""

import json
import pytest
from lambdas.validate.handler import handler as validate_handler
from lambdas.threat_analysis.handler import handler as threat_handler
from lambdas.risk_evaluation.handler import handler as risk_handler
from lambdas.build_result.handler import handler


API_PROVEEDORES = {
    "assessment_data": {
        "context": {
            "solution_name": "API Proveedores", "description": "test",
            "solution_type": "api", "criticality": "high",
            "internet_exposed": True, "external_users": True,
            "sensitive_data": True, "third_party": True,
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
            "has_security_logs": True, "has_audit_trail": True,
            "has_shared_credentials": False, "has_least_privilege": True,
            "has_rto": False, "has_rpo": False,
        },
    }
}


@pytest.fixture
def full_pipeline_via_handlers():
    """Execute all 4 handlers in sequence."""
    # 1. Validate
    v_out = validate_handler(API_PROVEEDORES)
    assessment = v_out["assessment"]

    # 2. Threat Analysis
    t_out = threat_handler({"assessment": assessment})
    findings = t_out["findings"]

    # 3. Risk Evaluation
    r_out = risk_handler({"assessment": assessment, "findings": findings})

    # 4. Build Result
    b_out = handler({
        "assessment": assessment,
        "findings_with_risk": r_out["findings_with_risk"],
        "zt_report": r_out["zt_report"],
        "gate": r_out["gate"],
        "recommendations": r_out["recommendations"],
    })
    return b_out


class TestBuildResultHandler:
    def test_result_has_all_fields(self, full_pipeline_via_handlers):
        result = full_pipeline_via_handlers["result"]
        required_keys = ["assessment", "findings", "zt_report", "gate",
                         "recommendations", "risk_summary", "stride_summary",
                         "overall_risk", "viz_nodes"]
        for key in required_keys:
            assert key in result, f"Missing key: {key}"

    def test_output_is_json_serializable(self, full_pipeline_via_handlers):
        json_str = json.dumps(full_pipeline_via_handlers)
        assert len(json_str) > 0

    def test_risk_summary_correct(self, full_pipeline_via_handlers):
        rs = full_pipeline_via_handlers["result"]["risk_summary"]
        assert rs["critical"] >= 2
        assert rs["high"] >= 2

    def test_overall_risk_critical(self, full_pipeline_via_handlers):
        assert full_pipeline_via_handlers["result"]["overall_risk"] == "critical"

    def test_gate_requires_review(self, full_pipeline_via_handlers):
        gate = full_pipeline_via_handlers["result"]["gate"]
        assert "REQUIERE" in gate["decision"]

    def test_viz_nodes_present(self, full_pipeline_via_handlers):
        viz = full_pipeline_via_handlers["result"]["viz_nodes"]
        assert len(viz) >= 4  # Internet + 4 components

    def test_idempotent(self):
        v_out = validate_handler(API_PROVEEDORES)
        t_out = threat_handler({"assessment": v_out["assessment"]})
        r_out = risk_handler({"assessment": v_out["assessment"], "findings": t_out["findings"]})
        event = {
            "assessment": v_out["assessment"],
            "findings_with_risk": r_out["findings_with_risk"],
            "zt_report": r_out["zt_report"],
            "gate": r_out["gate"],
            "recommendations": r_out["recommendations"],
        }
        r1 = handler(event)
        r2 = handler(event)
        assert r1 == r2
