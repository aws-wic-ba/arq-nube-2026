"""Unit tests for the Rule Engine."""

import pytest
from engine.models import Assessment, AssessmentContext, ComponentProperties, GeneralControls
from engine.rules import load_rules, evaluate_threats, matches_conditions, validate_rule


def make_assessment(**overrides):
    """Helper to build a minimal assessment for testing."""
    ctx = AssessmentContext(
        solution_name="Test",
        description="",
        solution_type="api",
        criticality="high",
        internet_exposed=True,
        external_users=True,
        sensitive_data=True,
        third_party=True,
    )
    components = overrides.get("components", [])
    return Assessment(context=ctx, components=components, general_controls=GeneralControls())


def make_component(comp_type, **props):
    """Helper to build a component with specific properties."""
    return ComponentProperties(component_type=comp_type, properties=props)


class TestMatchesConditions:
    def test_all_conditions_true(self):
        assessment = make_assessment(components=[
            make_component("api", internet_exposed=True, has_authentication=False)
        ])
        conditions = {"api.internet_exposed": True, "api.has_authentication": False}
        assert matches_conditions(assessment, conditions) is True

    def test_one_condition_fails(self):
        assessment = make_assessment(components=[
            make_component("api", internet_exposed=True, has_authentication=True)
        ])
        conditions = {"api.internet_exposed": True, "api.has_authentication": False}
        assert matches_conditions(assessment, conditions) is False

    def test_missing_component_returns_false(self):
        assessment = make_assessment(components=[
            make_component("frontend", internet_exposed=True)
        ])
        conditions = {"api.internet_exposed": True}
        assert matches_conditions(assessment, conditions) is False

    def test_context_path_resolves(self):
        assessment = make_assessment(components=[])
        conditions = {"context.internet_exposed": True}
        assert matches_conditions(assessment, conditions) is True

    def test_property_not_set_defaults_false(self):
        assessment = make_assessment(components=[
            make_component("api", internet_exposed=True)
        ])
        conditions = {"api.has_rate_limiting": False}
        assert matches_conditions(assessment, conditions) is True


class TestEvaluateThreats:
    def test_matching_rule_produces_finding(self):
        rules = [{
            "id": "TEST-001",
            "title": "Test rule",
            "component": "api",
            "conditions": {"api.internet_exposed": True, "api.has_authentication": False},
            "stride": "Spoofing",
            "base_likelihood": 4,
            "base_impact": 4,
            "description": "Test",
            "control_id": "SEC-01",
            "reference": "Test ref",
        }]
        assessment = make_assessment(components=[
            make_component("api", internet_exposed=True, has_authentication=False)
        ])
        findings = evaluate_threats(assessment, rules)
        assert len(findings) == 1
        assert findings[0]["rule_id"] == "TEST-001"
        assert findings[0]["stride"] == "Spoofing"

    def test_non_matching_rule_produces_no_finding(self):
        rules = [{
            "id": "TEST-001",
            "title": "Test rule",
            "component": "api",
            "conditions": {"api.internet_exposed": True, "api.has_authentication": False},
            "stride": "Spoofing",
            "base_likelihood": 4,
            "base_impact": 4,
            "description": "Test",
            "control_id": "SEC-01",
            "reference": "Test ref",
        }]
        assessment = make_assessment(components=[
            make_component("api", internet_exposed=True, has_authentication=True)
        ])
        findings = evaluate_threats(assessment, rules)
        assert len(findings) == 0

    def test_multiple_rules_can_match(self):
        rules = [
            {
                "id": "TEST-001",
                "title": "Rule 1",
                "component": "api",
                "conditions": {"api.internet_exposed": True, "api.has_rate_limiting": False},
                "stride": "Denial of Service",
                "base_likelihood": 4,
                "base_impact": 3,
                "description": "DoS",
                "control_id": "SEC-01",
                "reference": "",
            },
            {
                "id": "TEST-002",
                "title": "Rule 2",
                "component": "api",
                "conditions": {"api.has_authentication": True, "api.has_authorization": False},
                "stride": "Elevation of Privilege",
                "base_likelihood": 3,
                "base_impact": 4,
                "description": "EoP",
                "control_id": "SEC-02",
                "reference": "",
            },
        ]
        assessment = make_assessment(components=[
            make_component("api", internet_exposed=True, has_authentication=True,
                           has_rate_limiting=False, has_authorization=False)
        ])
        findings = evaluate_threats(assessment, rules)
        assert len(findings) == 2

    def test_rule_skipped_if_component_not_in_assessment(self):
        rules = [{
            "id": "TEST-001",
            "title": "DB rule",
            "component": "database",
            "conditions": {"database.has_encryption_at_rest": False},
            "stride": "Information Disclosure",
            "base_likelihood": 3,
            "base_impact": 5,
            "description": "Test",
            "control_id": "SEC-01",
            "reference": "",
        }]
        assessment = make_assessment(components=[
            make_component("api", internet_exposed=True)
        ])
        findings = evaluate_threats(assessment, rules)
        assert len(findings) == 0


class TestValidateRule:
    def test_valid_rule_passes(self):
        rule = {
            "id": "R1", "title": "T", "component": "api",
            "conditions": {"api.x": True}, "stride": "Spoofing",
            "base_likelihood": 3, "base_impact": 4,
            "description": "D", "control_id": "C",
        }
        validate_rule(rule)  # Should not raise

    def test_missing_field_raises(self):
        rule = {"id": "R1", "title": "T"}
        with pytest.raises(ValueError, match="missing required field"):
            validate_rule(rule)

    def test_invalid_likelihood_raises(self):
        rule = {
            "id": "R1", "title": "T", "component": "api",
            "conditions": {"api.x": True}, "stride": "Spoofing",
            "base_likelihood": 6, "base_impact": 3,
            "description": "D", "control_id": "C",
        }
        with pytest.raises(ValueError, match="base_likelihood"):
            validate_rule(rule)

    def test_invalid_stride_raises(self):
        rule = {
            "id": "R1", "title": "T", "component": "api",
            "conditions": {"api.x": True}, "stride": "InvalidCategory",
            "base_likelihood": 3, "base_impact": 3,
            "description": "D", "control_id": "C",
        }
        with pytest.raises(ValueError, match="invalid STRIDE"):
            validate_rule(rule)
