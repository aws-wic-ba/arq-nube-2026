"""Tests for Validate Lambda handler."""

import json
import pytest
from lambdas.validate.handler import handler
from engine.exceptions import ValidationError

VALID_INPUT = {
    "assessment_data": {
        "context": {
            "solution_name": "Test", "description": "", "solution_type": "api",
            "criticality": "high", "internet_exposed": True, "external_users": True,
            "sensitive_data": True, "third_party": True,
        },
        "components": ["api", "database"],
        "properties": {
            "api": {"internet_exposed": True, "has_authentication": True},
            "database": {"handles_sensitive_data": True, "has_encryption_at_rest": False},
        },
        "general_controls": {
            "has_security_logs": True, "has_audit_trail": True,
            "has_shared_credentials": False, "has_least_privilege": True,
            "has_rto": False, "has_rpo": False,
        },
    }
}


class TestValidateHandler:
    def test_valid_input_returns_assessment(self):
        result = handler(VALID_INPUT)
        assert "assessment" in result
        assert result["assessment"]["context"]["solution_name"] == "Test"
        assert len(result["assessment"]["components"]) == 2

    def test_output_is_json_serializable(self):
        result = handler(VALID_INPUT)
        json_str = json.dumps(result)
        assert len(json_str) > 0

    def test_missing_assessment_data_raises_validation(self):
        with pytest.raises(ValidationError):
            handler({})

    def test_missing_solution_name_raises_validation(self):
        bad_input = {"assessment_data": dict(VALID_INPUT["assessment_data"])}
        bad_input["assessment_data"]["context"] = dict(bad_input["assessment_data"]["context"])
        bad_input["assessment_data"]["context"]["solution_name"] = ""
        with pytest.raises(ValidationError) as exc:
            handler(bad_input)
        assert "solution_name" in str(exc.value)

    def test_invalid_criticality_raises_validation(self):
        bad_input = {"assessment_data": dict(VALID_INPUT["assessment_data"])}
        bad_input["assessment_data"]["context"] = dict(bad_input["assessment_data"]["context"])
        bad_input["assessment_data"]["context"]["criticality"] = "extreme"
        with pytest.raises(ValidationError):
            handler(bad_input)

    def test_idempotent(self):
        r1 = handler(VALID_INPUT)
        r2 = handler(VALID_INPUT)
        assert r1 == r2
