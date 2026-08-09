"""Unit tests for Recommendation resolution."""

from engine.recommendations import resolve_recommendations


def make_finding(control_id="SEC-IAM-01", score=16, level="critical"):
    return {
        "rule_id": "TEST-001",
        "title": "Test",
        "component": "api",
        "stride": "Spoofing",
        "description": "Test",
        "evidence": [],
        "base_likelihood": 4,
        "base_impact": 4,
        "control_id": control_id,
        "reference": "",
        "risk": {"score": score, "level": level},
    }


SAMPLE_CONTROLS = {
    "SEC-IAM-01": {
        "requirement": "Implement authentication.",
        "control": "API Authentication",
        "aws_services": ["Amazon Cognito"],
        "explanation": "Validates identity.",
        "reference": "AWS WAF SEC-2",
    }
}


class TestRecommendations:
    def test_resolves_valid_control(self):
        findings = [make_finding("SEC-IAM-01")]
        recs = resolve_recommendations(findings, SAMPLE_CONTROLS)
        assert len(recs) == 1
        assert recs[0]["control_id"] == "SEC-IAM-01"
        assert recs[0]["requirement"] == "Implement authentication."
        assert "Amazon Cognito" in recs[0]["aws_services"]

    def test_unknown_control_id_handled(self):
        findings = [make_finding("SEC-UNKNOWN-99")]
        recs = resolve_recommendations(findings, SAMPLE_CONTROLS)
        assert len(recs) == 1
        assert "no encontrado" in recs[0]["requirement"]

    def test_groups_by_control_id(self):
        findings = [
            make_finding("SEC-IAM-01", score=20, level="critical"),
            make_finding("SEC-IAM-01", score=15, level="high"),
        ]
        recs = resolve_recommendations(findings, SAMPLE_CONTROLS)
        assert len(recs) == 1
        assert len(recs[0]["related_findings"]) == 2
        assert recs[0]["max_risk_score"] == 20

    def test_sorted_by_max_score_desc(self):
        findings = [
            make_finding("SEC-IAM-01", score=10, level="medium"),
            make_finding("SEC-DOS-01", score=20, level="critical"),
        ]
        controls = {
            "SEC-IAM-01": SAMPLE_CONTROLS["SEC-IAM-01"],
            "SEC-DOS-01": {
                "requirement": "Rate limit.",
                "control": "Throttling",
                "aws_services": ["API GW"],
                "explanation": "Limits.",
                "reference": "R",
            }
        }
        recs = resolve_recommendations(findings, controls)
        assert recs[0]["control_id"] == "SEC-DOS-01"
        assert recs[1]["control_id"] == "SEC-IAM-01"
