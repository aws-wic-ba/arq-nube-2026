"""Unit tests for the Security Architecture Gate."""

from engine.gate import determine_gate, GATE_APPROVED, GATE_OBSERVATIONS, GATE_REQUIRES_REVIEW


def make_finding(level="medium"):
    return {"risk": {"level": level, "score": 10}}


class TestGate:
    def test_no_findings_approved(self):
        result = determine_gate([])
        assert result["decision"] == GATE_APPROVED

    def test_only_low_approved(self):
        findings = [make_finding("low"), make_finding("low")]
        result = determine_gate(findings)
        assert result["decision"] == GATE_APPROVED

    def test_one_medium_observations(self):
        findings = [make_finding("low"), make_finding("medium")]
        result = determine_gate(findings)
        assert result["decision"] == GATE_OBSERVATIONS

    def test_one_high_observations(self):
        findings = [make_finding("high")]
        result = determine_gate(findings)
        assert result["decision"] == GATE_OBSERVATIONS

    def test_two_high_requires_review(self):
        findings = [make_finding("high"), make_finding("high")]
        result = determine_gate(findings)
        assert result["decision"] == GATE_REQUIRES_REVIEW

    def test_one_critical_requires_review(self):
        findings = [make_finding("critical")]
        result = determine_gate(findings)
        assert result["decision"] == GATE_REQUIRES_REVIEW

    def test_mixed_critical_low(self):
        findings = [make_finding("critical"), make_finding("low"), make_finding("low")]
        result = determine_gate(findings)
        assert result["decision"] == GATE_REQUIRES_REVIEW

    def test_gate_has_next_action(self):
        result = determine_gate([])
        assert "next_action" in result
        assert result["next_action"] != ""
