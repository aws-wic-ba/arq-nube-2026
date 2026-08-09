"""Architecture visualization — generates node data for rendering.

Framework-agnostic: produces a data structure that can be rendered
by Jinja templates (Flask) or serialized to JSON (API/Lambda).
"""

from typing import List, Dict, Any, Optional
from engine.models import Assessment


# Display metadata for component types
COMPONENT_DISPLAY = {
    "frontend": {"icon": "&#9741;", "label": "Frontend"},
    "api": {"icon": "&#8644;", "label": "API"},
    "database": {"icon": "&#9707;", "label": "Database"},
    "files_storage": {"icon": "&#9776;", "label": "Files / Storage"},
    "queue_messaging": {"icon": "&#8651;", "label": "Queue / Messaging"},
    "external_system": {"icon": "&#9729;", "label": "External System"},
}

# Rendering order for components
TYPE_ORDER = ["frontend", "api", "database", "files_storage", "queue_messaging", "external_system"]


def build_visualization(
    assessment: Assessment,
    findings: Optional[List[Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """
    Generate visualization node list with optional threat counts.

    Args:
        assessment: Parsed Assessment object
        findings: List of findings with risk data (None if pre-analysis)

    Returns:
        List of node dicts with: type, icon, label, threat_count, max_level
    """
    nodes = []

    # Internet entry point
    if assessment.context.internet_exposed:
        nodes.append({
            "type": "internet",
            "icon": "&#127760;",
            "label": "Internet",
            "threat_count": 0,
            "max_level": "",
        })

    for comp_type in TYPE_ORDER:
        if assessment.has_component(comp_type):
            display = COMPONENT_DISPLAY.get(comp_type, {})
            threat_count = 0
            max_level = ""

            if findings:
                comp_findings = [f for f in findings if f["component"] == comp_type]
                threat_count = len(comp_findings)
                if comp_findings:
                    level_order = {"critical": 4, "high": 3, "medium": 2, "low": 1}
                    max_level = max(
                        comp_findings,
                        key=lambda f: level_order.get(f["risk"]["level"], 0)
                    )["risk"]["level"]

            nodes.append({
                "type": comp_type,
                "icon": display.get("icon", ""),
                "label": display.get("label", comp_type),
                "threat_count": threat_count,
                "max_level": max_level,
            })

    return nodes
