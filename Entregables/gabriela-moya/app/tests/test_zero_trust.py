"""Unit tests for the Zero Trust Engine."""

from engine.models import Assessment, AssessmentContext, ComponentProperties, GeneralControls
from engine.zero_trust import evaluate_zero_trust


def make_assessment(components=None, gc_overrides=None):
    ctx = AssessmentContext(
        solution_name="Test", description="", solution_type="api",
        criticality="high", internet_exposed=True,
        external_users=True, sensitive_data=True, third_party=True,
    )
    gc = GeneralControls(**(gc_overrides or {}))
    return Assessment(context=ctx, components=components or [], general_controls=gc)


class TestZeroTrust:
    def test_all_cumple(self):
        """Well-secured assessment should mostly show cumple."""
        components = [
            ComponentProperties("api", {
                "internet_exposed": True, "has_authentication": True,
                "has_authorization": True, "has_encryption_in_transit": True,
            }),
            ComponentProperties("database", {
                "handles_sensitive_data": True, "has_encryption_at_rest": True,
                "internet_exposed": False,
            }),
        ]
        gc = {"has_security_logs": True, "has_audit_trail": True,
              "has_least_privilege": True, "has_shared_credentials": False}
        assessment = make_assessment(components, gc)
        report = evaluate_zero_trust(assessment)
        alignments = [d["alignment"] for d in report["dimensions"]]
        assert all(a == "cumple" for a in alignments)
        assert report["overall_percentage"] == 100

    def test_brecha_when_no_auth(self):
        """Exposed component without auth should create identity brecha."""
        components = [
            ComponentProperties("api", {
                "internet_exposed": True, "has_authentication": False,
            }),
        ]
        assessment = make_assessment(components)
        report = evaluate_zero_trust(assessment)
        identity = next(d for d in report["dimensions"] if d["name"] == "Identity")
        assert identity["alignment"] == "brecha"

    def test_parcial_visibility(self):
        """Logs yes but no audit trail → parcial not possible here (brecha because any brecha = brecha)."""
        gc = {"has_security_logs": True, "has_audit_trail": False}
        assessment = make_assessment([], gc)
        report = evaluate_zero_trust(assessment)
        visibility = next(d for d in report["dimensions"] if d["name"] == "Visibility / Traceability")
        # One check is brecha → dimension is brecha
        assert visibility["alignment"] == "brecha"

    def test_data_protection_brecha(self):
        """Sensitive data without encryption → brecha."""
        components = [
            ComponentProperties("database", {
                "handles_sensitive_data": True, "has_encryption_at_rest": False,
            }),
        ]
        assessment = make_assessment(components)
        report = evaluate_zero_trust(assessment)
        dp = next(d for d in report["dimensions"] if d["name"] == "Data Protection")
        assert dp["alignment"] == "brecha"

    def test_five_dimensions_always(self):
        """Report always has exactly 5 dimensions."""
        assessment = make_assessment([])
        report = evaluate_zero_trust(assessment)
        assert len(report["dimensions"]) == 5
