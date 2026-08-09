"""Tests for DynamoDB schema and item builders."""

import json
import pytest

from infrastructure.dynamodb.schema import (
    TABLE_SCHEMA,
    STATUS_PROCESSING, STATUS_COMPLETED, STATUS_FAILED,
    VALID_STATUSES, VALID_TRANSITIONS,
    build_processing_item, build_completed_update, build_failed_update,
    estimate_item_size, check_item_size,
    DYNAMODB_MAX_ITEM_SIZE_BYTES,
)
from engine.pipeline import run_analysis
from engine.rules import load_rules
from engine.recommendations import load_controls
from engine.contracts import result_to_dict


# Regression input
API_PROVEEDORES = {
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


class TestTableSchema:
    def test_has_partition_key(self):
        keys = TABLE_SCHEMA["KeySchema"]
        assert any(k["AttributeName"] == "assessment_id" and k["KeyType"] == "HASH" for k in keys)

    def test_pay_per_request(self):
        assert TABLE_SCHEMA["BillingMode"] == "PAY_PER_REQUEST"


class TestProcessingItem:
    def test_shape(self):
        item = build_processing_item(
            assessment_id="test-123",
            input_data=API_PROVEEDORES,
            created_at="2026-08-08T10:00:00+00:00",
        )
        assert item["assessment_id"] == "test-123"
        assert item["status"] == STATUS_PROCESSING
        assert item["created_at"] == "2026-08-08T10:00:00+00:00"
        assert item["updated_at"] == "2026-08-08T10:00:00+00:00"
        assert item["input"] == API_PROVEEDORES

    def test_json_serializable(self):
        item = build_processing_item("id-1", API_PROVEEDORES)
        json_str = json.dumps(item)
        assert len(json_str) > 0

    def test_auto_timestamp(self):
        item = build_processing_item("id-1", {})
        assert "T" in item["created_at"]  # ISO format


class TestCompletedUpdate:
    def test_shape(self):
        result = {"gate": {"decision": "APROBADO"}, "findings": []}
        update = build_completed_update(result, completed_at="2026-08-08T10:05:00+00:00")
        assert update["status"] == STATUS_COMPLETED
        assert update["result"] == result
        assert update["completed_at"] == "2026-08-08T10:05:00+00:00"
        assert "updated_at" in update

    def test_with_real_result(self):
        rules = load_rules()
        controls = load_controls()
        result = result_to_dict(run_analysis(API_PROVEEDORES, rules, controls))
        update = build_completed_update(result)
        assert update["status"] == STATUS_COMPLETED
        assert update["result"]["gate"]["decision"] == "REQUIERE REVISIÓN DE ARQUITECTURA DE SEGURIDAD"

    def test_json_serializable(self):
        rules = load_rules()
        controls = load_controls()
        result = result_to_dict(run_analysis(API_PROVEEDORES, rules, controls))
        update = build_completed_update(result)
        json_str = json.dumps(update)
        assert len(json_str) > 0


class TestFailedUpdate:
    def test_shape(self):
        update = build_failed_update("ProcessingError", "Something went wrong")
        assert update["status"] == STATUS_FAILED
        assert update["error"]["type"] == "ProcessingError"
        assert update["error"]["message"] == "Something went wrong"
        assert "failed_at" in update
        assert "updated_at" in update

    def test_json_serializable(self):
        update = build_failed_update("Error", "msg")
        json_str = json.dumps(update)
        assert len(json_str) > 0


class TestStatusTransitions:
    def test_processing_can_become_completed(self):
        assert STATUS_COMPLETED in VALID_TRANSITIONS[STATUS_PROCESSING]

    def test_processing_can_become_failed(self):
        assert STATUS_FAILED in VALID_TRANSITIONS[STATUS_PROCESSING]

    def test_completed_cannot_transition(self):
        assert STATUS_COMPLETED not in VALID_TRANSITIONS

    def test_failed_cannot_transition(self):
        assert STATUS_FAILED not in VALID_TRANSITIONS


class TestSizeGuardrail:
    def test_small_item_within_limit(self):
        item = build_processing_item("id-1", {"context": {"solution_name": "x"}})
        result = check_item_size(item)
        assert result["within_limit"] is True
        assert result["needs_s3_offload"] is False

    def test_real_assessment_within_limit(self):
        rules = load_rules()
        controls = load_controls()
        analysis_result = result_to_dict(run_analysis(API_PROVEEDORES, rules, controls))
        item = build_processing_item("id-1", API_PROVEEDORES)
        # Simulate full COMPLETED item
        item["result"] = analysis_result
        result = check_item_size(item)
        assert result["within_limit"] is True
        assert result["size_bytes"] < 100_000  # Should be well under 100KB

    def test_detects_oversized(self):
        # Simulate large payload
        big_item = {"data": "x" * (400 * 1024)}
        result = check_item_size(big_item)
        assert result["within_limit"] is False
