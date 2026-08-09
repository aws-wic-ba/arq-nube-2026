"""Tests for canonical contracts — input validation and JSON serialization."""

import json
import pytest

from engine.contracts import validate_assessment_input, result_to_dict
from engine.pipeline import run_analysis
from engine.rules import load_rules
from engine.recommendations import load_controls


# Canonical test input: API Proveedores (regression case)
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

# Healthy case: API Interna Segura
API_INTERNA_INPUT = {
    "context": {
        "solution_name": "API Interna Segura",
        "description": "Backend interno seguro",
        "solution_type": "api",
        "criticality": "medium",
        "internet_exposed": False,
        "external_users": False,
        "sensitive_data": True,
        "third_party": False,
    },
    "components": ["api", "database"],
    "properties": {
        "api": {"internet_exposed": False, "has_authentication": True, "has_authorization": True,
                "has_rate_limiting": True, "has_input_validation": True, "has_encryption_in_transit": True},
        "database": {"handles_sensitive_data": True, "has_encryption_at_rest": True,
                     "internet_exposed": False, "has_backups": True},
    },
    "general_controls": {
        "has_security_logs": True, "has_audit_trail": True, "has_shared_credentials": False,
        "has_least_privilege": True, "has_rto": True, "has_rpo": True,
    },
}


class TestInputValidation:
    def test_valid_input_passes(self):
        errors = validate_assessment_input(API_PROVEEDORES_INPUT)
        assert errors == []

    def test_missing_context_fails(self):
        data = {"components": ["api"], "properties": {}, "general_controls": {}}
        errors = validate_assessment_input(data)
        assert any("context" in e for e in errors)

    def test_missing_solution_name_fails(self):
        data = dict(API_PROVEEDORES_INPUT)
        data["context"] = dict(data["context"])
        data["context"]["solution_name"] = ""
        errors = validate_assessment_input(data)
        assert any("solution_name" in e for e in errors)

    def test_invalid_criticality_fails(self):
        data = dict(API_PROVEEDORES_INPUT)
        data["context"] = dict(data["context"])
        data["context"]["criticality"] = "extreme"
        errors = validate_assessment_input(data)
        assert any("criticality" in e for e in errors)

    def test_invalid_component_fails(self):
        data = dict(API_PROVEEDORES_INPUT)
        data["components"] = ["api", "kubernetes"]
        errors = validate_assessment_input(data)
        assert any("kubernetes" in e for e in errors)

    def test_empty_components_fails(self):
        data = dict(API_PROVEEDORES_INPUT)
        data["components"] = []
        errors = validate_assessment_input(data)
        assert any("components" in e for e in errors)

    def test_boolean_fields_required(self):
        data = dict(API_PROVEEDORES_INPUT)
        data["context"] = dict(data["context"])
        data["context"]["internet_exposed"] = "yes"  # string, not bool
        errors = validate_assessment_input(data)
        assert any("internet_exposed" in e for e in errors)


class TestOutputSerialization:
    @pytest.fixture
    def rules(self):
        return load_rules()

    @pytest.fixture
    def controls(self):
        return load_controls()

    def test_result_is_json_serializable(self, rules, controls):
        """Full pipeline result must serialize to valid JSON."""
        result = run_analysis(API_PROVEEDORES_INPUT, rules, controls)
        serialized = result_to_dict(result)
        json_str = json.dumps(serialized, ensure_ascii=False)
        assert len(json_str) > 0

        # Roundtrip: JSON → dict → verify structure
        parsed = json.loads(json_str)
        assert "findings" in parsed
        assert "gate" in parsed
        assert "zt_report" in parsed
        assert "recommendations" in parsed
        assert "risk_summary" in parsed
        assert "overall_risk" in parsed

    def test_result_assessment_serialized_correctly(self, rules, controls):
        """Assessment dataclass must be a plain dict in serialized output."""
        result = run_analysis(API_PROVEEDORES_INPUT, rules, controls)
        serialized = result_to_dict(result)
        assessment = serialized["assessment"]
        assert isinstance(assessment, dict)
        assert assessment["context"]["solution_name"] == "API Proveedores"
        assert isinstance(assessment["components"], list)
        assert assessment["components"][0]["component_type"] == "frontend"

    def test_findings_are_plain_dicts(self, rules, controls):
        """Findings must be plain dicts (already are from engine)."""
        result = run_analysis(API_PROVEEDORES_INPUT, rules, controls)
        for f in result["findings"]:
            assert isinstance(f, dict)
            assert "risk" in f
            assert isinstance(f["risk"], dict)

    def test_healthy_case_serializable(self, rules, controls):
        """Healthy case (0 findings) also serializes correctly."""
        result = run_analysis(API_INTERNA_INPUT, rules, controls)
        serialized = result_to_dict(result)
        json_str = json.dumps(serialized, ensure_ascii=False)
        parsed = json.loads(json_str)
        assert parsed["gate"]["decision"] == "APROBADO"
        assert len(parsed["findings"]) == 0


class TestRegressionAPIProveedores:
    """Regression: API Proveedores must continue producing expected results."""

    @pytest.fixture
    def result(self):
        rules = load_rules()
        controls = load_controls()
        return run_analysis(API_PROVEEDORES_INPUT, rules, controls)

    def test_finds_elevation_of_privilege(self, result):
        strides = [f["stride"] for f in result["findings"]]
        assert "Elevation of Privilege" in strides

    def test_finds_denial_of_service(self, result):
        strides = [f["stride"] for f in result["findings"]]
        assert "Denial of Service" in strides

    def test_finds_db_info_disclosure(self, result):
        db_findings = [f for f in result["findings"]
                       if f["component"] == "database" and f["stride"] == "Information Disclosure"]
        assert len(db_findings) >= 1

    def test_finds_unmanaged_secrets(self, result):
        ext_findings = [f for f in result["findings"]
                        if f["component"] == "external_system" and f["stride"] == "Information Disclosure"]
        assert len(ext_findings) >= 1

    def test_gate_requires_review(self, result):
        assert result["gate"]["decision"] == "REQUIERE REVISIÓN DE ARQUITECTURA DE SEGURIDAD"

    def test_has_4_or_more_findings(self, result):
        assert len(result["findings"]) >= 4

    def test_overall_risk_critical(self, result):
        assert result["overall_risk"] == "critical"

    def test_zt_identity_cumple(self, result):
        identity = next(d for d in result["zt_report"]["dimensions"] if d["name"] == "Identity")
        assert identity["alignment"] == "cumple"

    def test_zt_access_brecha(self, result):
        access = next(d for d in result["zt_report"]["dimensions"] if d["name"] == "Access / Least Privilege")
        assert access["alignment"] == "brecha"

    def test_zt_data_protection_brecha(self, result):
        dp = next(d for d in result["zt_report"]["dimensions"] if d["name"] == "Data Protection")
        assert dp["alignment"] == "brecha"
