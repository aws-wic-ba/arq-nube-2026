"""Unit tests for the Risk Engine."""

import pytest
from engine.models import Assessment, AssessmentContext, ComponentProperties, GeneralControls
from engine.risk import calculate_risks, classify_risk


def make_assessment(criticality="high", internet_exposed=True, sensitive_data=True):
    ctx = AssessmentContext(
        solution_name="Test", description="", solution_type="api",
        criticality=criticality, internet_exposed=internet_exposed,
        external_users=True, sensitive_data=sensitive_data, third_party=True,
    )
    return Assessment(context=ctx, components=[], general_controls=GeneralControls())


def make_finding(component="api", stride="Spoofing", base_l=3, base_i=3, **extra):
    f = {
        "rule_id": "TEST-001",
        "title": "Test",
        "component": component,
        "stride": stride,
        "description": "Test finding",
        "evidence": [],
        "base_likelihood": base_l,
        "base_impact": base_i,
        "control_id": "SEC-01",
        "reference": "",
    }
    f.update(extra)
    return f


class TestClassifyRisk:
    @pytest.mark.parametrize("score,expected", [
        (1, "low"), (5, "low"),
        (6, "medium"), (10, "medium"),
        (11, "high"), (15, "high"),
        (16, "critical"), (25, "critical"),
    ])
    def test_classification_boundaries(self, score, expected):
        assert classify_risk(score) == expected


class TestCalculateRisks:
    def test_basic_calculation(self):
        assessment = make_assessment(criticality="low", internet_exposed=False, sensitive_data=False)
        assessment.components = [ComponentProperties("api", {"internet_exposed": False})]
        findings = [make_finding(base_l=3, base_i=2)]
        results = calculate_risks(findings, assessment)
        assert len(results) == 1
        r = results[0]["risk"]
        assert r["final_likelihood"] == 3
        assert r["final_impact"] == 2
        assert r["score"] == 6
        assert r["level"] == "medium"

    def test_internet_exposure_modifier(self):
        assessment = make_assessment(criticality="low", sensitive_data=False)
        assessment.components = [ComponentProperties("api", {"internet_exposed": True})]
        findings = [make_finding(base_l=3, base_i=2)]
        results = calculate_risks(findings, assessment)
        r = results[0]["risk"]
        assert r["final_likelihood"] == 4  # +1 for internet
        assert "Componente expuesto a Internet" in r["likelihood_modifiers"][0]

    def test_criticality_modifier(self):
        assessment = make_assessment(criticality="high", internet_exposed=False, sensitive_data=False)
        assessment.components = [ComponentProperties("api", {"internet_exposed": False})]
        findings = [make_finding(base_l=3, base_i=2)]
        results = calculate_risks(findings, assessment)
        r = results[0]["risk"]
        assert r["final_impact"] == 3  # +1 for high criticality

    def test_sensitive_data_modifier_on_info_disclosure(self):
        assessment = make_assessment(criticality="low", internet_exposed=False, sensitive_data=True)
        assessment.components = [ComponentProperties("database", {"handles_sensitive_data": True})]
        findings = [make_finding(component="database", stride="Information Disclosure", base_l=3, base_i=3)]
        results = calculate_risks(findings, assessment)
        r = results[0]["risk"]
        assert r["final_impact"] == 4  # +1 for sensitive data + confidentiality threat

    def test_cap_at_5(self):
        assessment = make_assessment(criticality="critical", sensitive_data=True)
        assessment.components = [ComponentProperties("database", {
            "internet_exposed": True, "handles_sensitive_data": True
        })]
        findings = [make_finding(component="database", stride="Information Disclosure", base_l=5, base_i=5)]
        results = calculate_risks(findings, assessment)
        r = results[0]["risk"]
        assert r["final_likelihood"] <= 5
        assert r["final_impact"] <= 5
        assert r["score"] == 25
        assert r["level"] == "critical"

    def test_modifiers_recorded(self):
        assessment = make_assessment(criticality="high")
        assessment.components = [ComponentProperties("api", {"internet_exposed": True})]
        findings = [make_finding(stride="Tampering", base_l=3, base_i=3)]
        results = calculate_risks(findings, assessment)
        r = results[0]["risk"]
        assert len(r["likelihood_modifiers"]) >= 1
        assert len(r["impact_modifiers"]) >= 1
