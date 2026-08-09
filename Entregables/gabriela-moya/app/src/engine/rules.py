"""Threat Rule Engine — deterministic, JSON-based threat identification."""

import json
import os
from typing import List, Dict, Any

from engine.models import Assessment

# Required fields in each rule
REQUIRED_RULE_FIELDS = [
    "id", "title", "component", "conditions", "stride",
    "base_likelihood", "base_impact", "description", "control_id",
]


def load_rules(filepath: str = None) -> List[Dict[str, Any]]:
    """
    Load and validate threat rules from JSON file.

    Raises ValueError if any rule is invalid.
    """
    if filepath is None:
        data_dir = os.environ.get("DATA_DIR",
                                  os.path.join(os.path.dirname(__file__), "..", "..", "data"))
        filepath = os.path.join(data_dir, "threat_rules.json")

    with open(filepath, "r", encoding="utf-8") as f:
        rules = json.load(f)

    if not isinstance(rules, list):
        raise ValueError("threat_rules.json must be a JSON array.")

    for rule in rules:
        validate_rule(rule)

    return rules


def validate_rule(rule: dict) -> None:
    """Validate a single rule has all required fields and valid ranges."""
    for field_name in REQUIRED_RULE_FIELDS:
        if field_name not in rule:
            raise ValueError(
                f"Rule {rule.get('id', 'UNKNOWN')} missing required field: {field_name}"
            )

    if not isinstance(rule["conditions"], dict) or not rule["conditions"]:
        raise ValueError(f"Rule {rule['id']}: conditions must be a non-empty dict.")

    if not 1 <= rule["base_likelihood"] <= 5:
        raise ValueError(f"Rule {rule['id']}: base_likelihood must be 1-5.")

    if not 1 <= rule["base_impact"] <= 5:
        raise ValueError(f"Rule {rule['id']}: base_impact must be 1-5.")

    valid_stride = [
        "Spoofing", "Tampering", "Repudiation",
        "Information Disclosure", "Denial of Service", "Elevation of Privilege",
    ]
    if rule["stride"] not in valid_stride:
        raise ValueError(f"Rule {rule['id']}: invalid STRIDE category '{rule['stride']}'.")


def evaluate_threats(assessment: Assessment, rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Match assessment against all threat rules.

    For each rule:
    1. Check if the rule's target component is in the assessment
    2. Resolve all condition paths against the assessment
    3. If ALL conditions match (AND logic), produce a finding

    Returns a list of findings (dicts).
    """
    findings = []

    for rule in rules:
        target_component = rule["component"]

        # Special case: _general rules apply if any component exists (solution-level)
        if target_component == "_general":
            if matches_conditions(assessment, rule["conditions"]):
                evidence = build_evidence(assessment, rule["conditions"])
                finding = {
                    "rule_id": rule["id"],
                    "title": rule["title"],
                    "component": "general",
                    "stride": rule["stride"],
                    "description": rule["description"],
                    "evidence": evidence,
                    "base_likelihood": rule["base_likelihood"],
                    "base_impact": rule["base_impact"],
                    "control_id": rule["control_id"],
                    "reference": rule.get("reference", ""),
                }
                findings.append(finding)
            continue

        # Skip if the target component is not part of the assessment
        if not assessment.has_component(target_component):
            continue

        # Evaluate all conditions (AND logic)
        if matches_conditions(assessment, rule["conditions"]):
            evidence = build_evidence(assessment, rule["conditions"])
            finding = {
                "rule_id": rule["id"],
                "title": rule["title"],
                "component": target_component,
                "stride": rule["stride"],
                "description": rule["description"],
                "evidence": evidence,
                "base_likelihood": rule["base_likelihood"],
                "base_impact": rule["base_impact"],
                "control_id": rule["control_id"],
                "reference": rule.get("reference", ""),
            }
            findings.append(finding)

    return findings


def matches_conditions(assessment: Assessment, conditions: Dict[str, Any]) -> bool:
    """
    Evaluate whether ALL conditions are satisfied (AND logic).

    Each condition is a path → expected_value pair.
    All must resolve to the expected value for the rule to match.
    """
    for path, expected_value in conditions.items():
        actual_value = assessment.resolve_path(path)

        # If path can't be resolved, condition doesn't match
        if actual_value is None:
            return False

        if actual_value != expected_value:
            return False

    return True


def build_evidence(assessment: Assessment, conditions: Dict[str, Any]) -> List[str]:
    """Build human-readable evidence strings from matched conditions."""
    evidence = []
    for path, expected_value in conditions.items():
        parts = path.split(".", 1)
        if len(parts) == 2:
            component, prop = parts
            value_str = "Sí" if expected_value else "No"
            evidence.append(f"{component}.{prop} = {value_str}")
    return evidence
