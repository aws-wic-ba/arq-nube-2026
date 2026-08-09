"""Tests for canonical Assessment dict ↔ dataclass roundtrip."""

import json
import dataclasses

from engine.models import (
    Assessment, AssessmentContext, ComponentProperties, GeneralControls,
    assessment_from_dict, assessment_to_dict, parse_session_to_assessment,
)


CANONICAL_DICT = {
    "context": {
        "solution_name": "Test",
        "description": "desc",
        "solution_type": "api",
        "criticality": "high",
        "internet_exposed": True,
        "external_users": True,
        "sensitive_data": True,
        "third_party": False,
    },
    "components": [
        {"component_type": "api", "properties": {"internet_exposed": True, "has_authentication": True}},
        {"component_type": "database", "properties": {"handles_sensitive_data": True, "has_encryption_at_rest": False}},
    ],
    "general_controls": {
        "has_security_logs": True,
        "has_audit_trail": True,
        "has_shared_credentials": False,
        "has_least_privilege": True,
        "has_rto": False,
        "has_rpo": False,
    },
}


class TestAssessmentFromDict:
    def test_creates_assessment(self):
        a = assessment_from_dict(CANONICAL_DICT)
        assert isinstance(a, Assessment)
        assert a.context.solution_name == "Test"
        assert len(a.components) == 2
        assert a.components[0].component_type == "api"
        assert a.components[0].get("internet_exposed") is True

    def test_empty_raises(self):
        import pytest
        with pytest.raises(ValueError):
            assessment_from_dict({})

    def test_missing_context_raises(self):
        import pytest
        with pytest.raises(ValueError):
            assessment_from_dict({"components": []})


class TestAssessmentToDict:
    def test_produces_plain_dict(self):
        a = assessment_from_dict(CANONICAL_DICT)
        d = assessment_to_dict(a)
        assert isinstance(d, dict)
        assert d["context"]["solution_name"] == "Test"
        assert isinstance(d["components"], list)
        assert d["components"][0]["component_type"] == "api"

    def test_json_serializable(self):
        a = assessment_from_dict(CANONICAL_DICT)
        d = assessment_to_dict(a)
        json_str = json.dumps(d)
        assert len(json_str) > 0


class TestRoundtrip:
    def test_dict_to_assessment_to_dict(self):
        """dict → Assessment → dict produces equivalent structure."""
        a = assessment_from_dict(CANONICAL_DICT)
        d = assessment_to_dict(a)
        # Roundtrip: the output dict should recreate the same Assessment
        a2 = assessment_from_dict(d)
        assert a2.context.solution_name == a.context.solution_name
        assert a2.context.criticality == a.context.criticality
        assert len(a2.components) == len(a.components)
        for c1, c2 in zip(a.components, a2.components):
            assert c1.component_type == c2.component_type
            assert c1.properties == c2.properties

    def test_json_roundtrip(self):
        """dict → JSON → dict → Assessment is stable."""
        a = assessment_from_dict(CANONICAL_DICT)
        json_str = json.dumps(assessment_to_dict(a))
        parsed = json.loads(json_str)
        a2 = assessment_from_dict(parsed)
        assert a2.context == a.context
        assert len(a2.components) == len(a.components)
