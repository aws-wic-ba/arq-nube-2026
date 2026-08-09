"""Tests for Threat Analysis Lambda handler."""

import json
import pytest
from lambdas.threat_analysis.handler import handler


ASSESSMENT_WITH_THREATS = {
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
    ],
    "general_controls": {
        "has_security_logs": True, "has_audit_trail": True,
        "has_shared_credentials": False, "has_least_privilege": True,
        "has_rto": False, "has_rpo": False,
    },
}

ASSESSMENT_NO_THREATS = {
    "context": {
        "solution_name": "Secure", "description": "", "solution_type": "api",
        "criticality": "medium", "internet_exposed": False, "external_users": False,
        "sensitive_data": True, "third_party": False,
    },
    "components": [
        {"component_type": "api", "properties": {
            "internet_exposed": False, "has_authentication": True, "has_authorization": True,
            "has_rate_limiting": True, "has_input_validation": True, "has_encryption_in_transit": True}},
        {"component_type": "database", "properties": {
            "handles_sensitive_data": True, "has_encryption_at_rest": True,
            "internet_exposed": False, "has_backups": True}},
    ],
    "general_controls": {
        "has_security_logs": True, "has_audit_trail": True,
        "has_shared_credentials": False, "has_least_privilege": True,
        "has_rto": True, "has_rpo": True,
    },
}


class TestThreatAnalysisHandler:
    def test_finds_threats(self):
        result = handler({"assessment": ASSESSMENT_WITH_THREATS})
        assert "findings" in result
        assert len(result["findings"]) >= 2

    def test_no_threats_for_secure_assessment(self):
        result = handler({"assessment": ASSESSMENT_NO_THREATS})
        assert result["findings"] == []

    def test_output_is_json_serializable(self):
        result = handler({"assessment": ASSESSMENT_WITH_THREATS})
        json_str = json.dumps(result)
        assert len(json_str) > 0

    def test_missing_assessment_raises(self):
        with pytest.raises(ValueError):
            handler({})

    def test_idempotent(self):
        r1 = handler({"assessment": ASSESSMENT_WITH_THREATS})
        r2 = handler({"assessment": ASSESSMENT_WITH_THREATS})
        assert r1 == r2

    def test_findings_have_required_fields(self):
        result = handler({"assessment": ASSESSMENT_WITH_THREATS})
        for f in result["findings"]:
            assert "rule_id" in f
            assert "stride" in f
            assert "component" in f
            assert "base_likelihood" in f
            assert "base_impact" in f
