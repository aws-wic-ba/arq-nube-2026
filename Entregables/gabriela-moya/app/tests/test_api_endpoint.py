"""Tests for the /api/assess JSON endpoint."""

import json
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src", "local_api"))

from app import app as flask_app


@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as client:
        yield client


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
            "has_security_logs": True, "has_audit_trail": True, "has_shared_credentials": False,
            "has_least_privilege": True, "has_rto": False, "has_rpo": False,
        },
    }
}


class TestApiAssessEndpoint:
    def test_valid_assessment_returns_200(self, client):
        resp = client.post("/api/assess", json=API_PROVEEDORES)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "assessment_id" in data
        assert "result" in data

    def test_result_has_all_fields(self, client):
        resp = client.post("/api/assess", json=API_PROVEEDORES)
        result = resp.get_json()["result"]
        for key in ["assessment", "findings", "zt_report", "gate",
                    "recommendations", "risk_summary", "stride_summary",
                    "overall_risk", "viz_nodes"]:
            assert key in result, f"Missing: {key}"

    def test_gate_requires_review_for_proveedores(self, client):
        resp = client.post("/api/assess", json=API_PROVEEDORES)
        gate = resp.get_json()["result"]["gate"]
        assert "REQUIERE" in gate["decision"]

    def test_missing_assessment_data_returns_400(self, client):
        resp = client.post("/api/assess", json={})
        assert resp.status_code == 400

    def test_invalid_input_returns_400(self, client):
        bad = {"assessment_data": {"context": {"solution_name": ""}, "components": [], "properties": {}, "general_controls": {}}}
        resp = client.post("/api/assess", json=bad)
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["error"] == "validation_error"
        assert len(data["details"]) > 0

    def test_response_is_json_serializable(self, client):
        resp = client.post("/api/assess", json=API_PROVEEDORES)
        # If we got here without error, Flask already serialized it
        data = resp.get_json()
        # Double-check roundtrip
        json_str = json.dumps(data)
        assert len(json_str) > 0


class TestFrontendServing:
    def test_app_route_serves_html(self, client):
        resp = client.get("/app/")
        assert resp.status_code == 200
        assert b"Secure Design Advisor" in resp.data

    def test_app_css_serves(self, client):
        resp = client.get("/app/css/style.css")
        assert resp.status_code == 200

    def test_app_js_serves(self, client):
        resp = client.get("/app/js/app.js")
        assert resp.status_code == 200
