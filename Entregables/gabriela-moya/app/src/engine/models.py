"""Assessment data model — normalizes session data for engine consumption."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class AssessmentContext:
    """Top-level context of the solution being evaluated."""

    solution_name: str
    description: str
    solution_type: str
    criticality: str  # low, medium, high, critical
    internet_exposed: bool
    external_users: bool
    sensitive_data: bool
    third_party: bool


@dataclass
class ComponentProperties:
    """Properties declared for a single component."""

    component_type: str
    properties: Dict[str, bool] = field(default_factory=dict)

    def get(self, prop_name: str, default: bool = False) -> bool:
        """Get a property value, defaulting to False."""
        return self.properties.get(prop_name, default)


@dataclass
class GeneralControls:
    """Cross-cutting security controls."""

    has_security_logs: bool = False
    has_audit_trail: bool = False
    has_shared_credentials: bool = False
    has_least_privilege: bool = False
    has_rto: bool = False
    has_rpo: bool = False


@dataclass
class Assessment:
    """Normalized assessment model used by engines."""

    context: AssessmentContext
    components: List[ComponentProperties] = field(default_factory=list)
    general_controls: GeneralControls = field(default_factory=GeneralControls)

    def get_component(self, component_type: str) -> Optional[ComponentProperties]:
        """Get a component by type."""
        for comp in self.components:
            if comp.component_type == component_type:
                return comp
        return None

    def has_component(self, component_type: str) -> bool:
        """Check if a component type is part of the assessment."""
        return any(c.component_type == component_type for c in self.components)

    def resolve_path(self, path: str) -> Optional[bool]:
        """
        Resolve a dot-separated path to a boolean value.

        Supported paths:
            context.<field>           e.g. context.internet_exposed
            <component>.<property>    e.g. api.has_authentication
            general_controls.<field>  e.g. general_controls.has_security_logs
        """
        parts = path.split(".", 1)
        if len(parts) != 2:
            return None

        prefix, attr = parts

        if prefix == "context":
            return getattr(self.context, attr, None)
        elif prefix == "general_controls":
            return getattr(self.general_controls, attr, None)
        else:
            # Treat prefix as component type
            comp = self.get_component(prefix)
            if comp is None:
                return None
            return comp.get(attr)


def parse_session_to_assessment(session_data: dict) -> Assessment:
    """
    Convert session['assessment'] dict into a typed Assessment model.

    This handles the Flask session format where:
    - components is a list of type strings
    - properties is a separate dict keyed by component type

    Raises ValueError if required data is missing.
    """
    if not session_data:
        raise ValueError("Assessment data is empty.")

    ctx_data = session_data.get("context")
    if not ctx_data:
        raise ValueError("Assessment context is missing.")

    context = AssessmentContext(
        solution_name=ctx_data.get("solution_name", ""),
        description=ctx_data.get("description", ""),
        solution_type=ctx_data.get("solution_type", ""),
        criticality=ctx_data.get("criticality", "medium"),
        internet_exposed=ctx_data.get("internet_exposed", False),
        external_users=ctx_data.get("external_users", False),
        sensitive_data=ctx_data.get("sensitive_data", False),
        third_party=ctx_data.get("third_party", False),
    )

    components = []
    comp_list = session_data.get("components", [])
    props_data = session_data.get("properties", {})

    for comp_type in comp_list:
        comp_props = props_data.get(comp_type, {})
        components.append(ComponentProperties(
            component_type=comp_type,
            properties=comp_props,
        ))

    gc_data = session_data.get("general_controls", {})
    general_controls = GeneralControls(
        has_security_logs=gc_data.get("has_security_logs", False),
        has_audit_trail=gc_data.get("has_audit_trail", False),
        has_shared_credentials=gc_data.get("has_shared_credentials", False),
        has_least_privilege=gc_data.get("has_least_privilege", False),
        has_rto=gc_data.get("has_rto", False),
        has_rpo=gc_data.get("has_rpo", False),
    )

    return Assessment(
        context=context,
        components=components,
        general_controls=general_controls,
    )


def assessment_from_dict(data: dict) -> Assessment:
    """
    Convert a canonical Assessment dict (from dataclasses.asdict) into an Assessment.

    This handles the normalized format where components is a list of dicts
    with 'component_type' and 'properties' fields embedded.

    This is the canonical conversion for Lambda adapters and any non-Flask consumer.
    """
    if not data:
        raise ValueError("Assessment data is empty.")

    ctx_data = data.get("context")
    if not ctx_data:
        raise ValueError("Assessment context is missing.")

    context = AssessmentContext(
        solution_name=ctx_data.get("solution_name", ""),
        description=ctx_data.get("description", ""),
        solution_type=ctx_data.get("solution_type", ""),
        criticality=ctx_data.get("criticality", "medium"),
        internet_exposed=ctx_data.get("internet_exposed", False),
        external_users=ctx_data.get("external_users", False),
        sensitive_data=ctx_data.get("sensitive_data", False),
        third_party=ctx_data.get("third_party", False),
    )

    components = []
    for comp_data in data.get("components", []):
        components.append(ComponentProperties(
            component_type=comp_data.get("component_type", ""),
            properties=comp_data.get("properties", {}),
        ))

    gc_data = data.get("general_controls", {})
    general_controls = GeneralControls(
        has_security_logs=gc_data.get("has_security_logs", False),
        has_audit_trail=gc_data.get("has_audit_trail", False),
        has_shared_credentials=gc_data.get("has_shared_credentials", False),
        has_least_privilege=gc_data.get("has_least_privilege", False),
        has_rto=gc_data.get("has_rto", False),
        has_rpo=gc_data.get("has_rpo", False),
    )

    return Assessment(
        context=context,
        components=components,
        general_controls=general_controls,
    )


def assessment_to_dict(assessment: Assessment) -> dict:
    """Convert an Assessment dataclass to a canonical plain dict."""
    import dataclasses
    return dataclasses.asdict(assessment)
