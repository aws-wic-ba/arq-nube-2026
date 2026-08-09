"""Domain exceptions for the Secure Design Advisor engine."""


class ValidationError(Exception):
    """Raised when assessment input fails validation."""

    def __init__(self, errors: list):
        self.errors = errors
        super().__init__(f"Validation failed: {errors}")


class RuleLoadingError(Exception):
    """Raised when threat rules or controls catalog cannot be loaded."""
    pass
