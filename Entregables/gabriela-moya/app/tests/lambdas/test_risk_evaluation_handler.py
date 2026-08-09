"""Tests for Risk Evaluation Lambda handler."""

import json
import pytest
from lambdas.threat_analysis.handler import handler as threat_handler
from lambdas.risk_evaluation.handler import handler


ASSESSMENT = {
    "context": {
        "solution_name": "API Proveedores", "description": "", "solution_type": "api",
        "criticality": "high", "internet_exposed": True, "external_users": True,
        "sensitive_data": True, "third_party": True,
    },
    "components": [
        {"component_type": "api", "properties": {
            "internet_exposed": True, "has_authentication": True, "has_authorization": False,
            "has_rate_limiting": False, "has_input_validation": True, "has_encryption_in_transit": True}},
        {"component_type": "database", "properties": {
            "handles_sensitive_data": True, "has_encryption_at_rest": False,
            "internet_exposed": False, "has_backups": True}},
        {"component_type": "external_system", "properties": {
            "has_encryption_in_transit": True, "has_authentication": True,
            "has_secrets": True, "has_managed_secrets": False}},
    ],
    "general_controls": {
        "has_security_logs": True, "has_audit_trail": True,
        "has_shared_credentials": False, "has_least_privilege": True,
        "has_rto": False, "has_rpo": False,
    },
}


@pytest.fixture
def findings():
    """Get raw findings from threat analysis."""
    result = threat_handler({"assessment": ASSESSMENT})
    return result["findings"]


class TestRiskEvaluationHandler:
    def test_returns_all_expected_fields(self, findings):
        result = handler({"assessment": ASSESSMENT, "findings": findings})
        assert "findings_with_risk" in result
        assert "zt_report" in result
        assert "gate" in result
        assert "recommendations" in result

    def test_risk_scores_present(self, findings):
        result = handler({"assessment": ASSESSMENT, "findings": findings})
        for f in result["findings_with_risk"]:
            assert "risk" in f
            assert "score" in f["risk"]
            assert "level" in f["risk"]

    def test_zero_trust_has_5_dimensions(self, findings):
        result = handler({"assessment": ASSESSMENT, "findings": findings})
        assert len(result["zt_report"]["dimensions"]) == 5

    def test_gate_decision_present(self, findings):
        result = handler({"assessment": ASSESSMENT, "findings": findings})
        assert result["gate"]["decision"] in [
            "APROBADO", "APROBADO CON OBSERVACIONES",
            "REQUIERE REVISIÓN DE ARQUITECTURA DE SEGURIDAD"
        ]

    def test_output_is_json_serializable(self, findings):
        result = handler({"assessment": ASSESSMENT, "findings": findings})
        json_str = json.dumps(result)
        assert len(json_str) > 0

    def test_idempotent(self, findings):
        r1 = handler({"assessment": ASSESSMENT, "findings": findings})
        r2 = handler({"assessment": ASSESSMENT, "findings": findings})
        assert r1 == r2
