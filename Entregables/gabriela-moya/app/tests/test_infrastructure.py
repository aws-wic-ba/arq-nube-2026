"""Tests for infrastructure definitions — validates structure and contracts."""

import json
import os
import yaml
import pytest


INFRA_DIR = os.path.join(os.path.dirname(__file__), "..", "infrastructure")


class TestASL:
    @pytest.fixture
    def asl(self):
        path = os.path.join(INFRA_DIR, "step-functions", "assessment-workflow.asl.json")
        with open(path) as f:
            return json.load(f)

    def test_parseable_json(self, asl):
        assert isinstance(asl, dict)

    def test_has_start_at(self, asl):
        assert asl["StartAt"] == "Initialize"

    def test_expected_states_exist(self, asl):
        expected = [
            "Initialize", "Validate", "MergeValidation", "PersistProcessing",
            "PrunePayload", "ThreatAnalysis", "RiskEvaluation", "BuildResult",
            "PersistCompleted", "FormatOutput", "PersistFailed", "Fail", "FailValidation",
        ]
        for state in expected:
            assert state in asl["States"], f"Missing state: {state}"

    def test_validate_catches_validation_error(self, asl):
        catches = asl["States"]["Validate"].get("Catch", [])
        error_types = [c["ErrorEquals"] for c in catches]
        assert ["ValidationError"] in error_types

    def test_threat_analysis_has_retry(self, asl):
        retries = asl["States"]["ThreatAnalysis"].get("Retry", [])
        assert len(retries) >= 1

    def test_persist_processing_is_dynamodb(self, asl):
        resource = asl["States"]["PersistProcessing"]["Resource"]
        assert "dynamodb" in resource

    def test_persist_completed_is_dynamodb(self, asl):
        resource = asl["States"]["PersistCompleted"]["Resource"]
        assert "dynamodb" in resource

    def test_format_output_produces_assessment_id_and_result(self, asl):
        params = asl["States"]["FormatOutput"]["Parameters"]
        assert "assessment_id.$" in params
        assert "result.$" in params

    def test_prune_removes_input(self, asl):
        params = asl["States"]["PrunePayload"]["Parameters"]
        assert "input.$" not in params  # input pruned
        assert "assessment.$" in params  # assessment kept

    def test_fail_validation_does_not_persist(self, asl):
        # FailValidation goes directly to Fail without DynamoDB
        state = asl["States"]["FailValidation"]
        assert state["Type"] == "Fail"

    def test_format_output_is_final_state(self, asl):
        state = asl["States"]["FormatOutput"]
        assert state.get("End") is True

    def test_final_output_has_assessment_id_and_result(self, asl):
        params = asl["States"]["FormatOutput"]["Parameters"]
        assert "assessment_id.$" in params
        assert "result.$" in params
        # Verify the exact paths
        assert params["assessment_id.$"] == "$.assessment_id"
        assert params["result.$"] == "$.build.result"

    def test_validate_catch_goes_to_fail_validation(self, asl):
        catches = asl["States"]["Validate"]["Catch"]
        target = catches[0]["Next"]
        assert target == "FailValidation"

    def test_post_persist_errors_go_to_persist_failed(self, asl):
        """States after PersistProcessing must catch to PersistFailed."""
        for state_name in ["ThreatAnalysis", "RiskEvaluation", "BuildResult"]:
            catches = asl["States"][state_name].get("Catch", [])
            targets = [c["Next"] for c in catches]
            assert "PersistFailed" in targets, f"{state_name} doesn't catch to PersistFailed"

    def test_persist_processing_uses_correct_table_var(self, asl):
        params = asl["States"]["PersistProcessing"]["Parameters"]
        assert params["TableName"] == "${AssessmentsTableName}"

    def test_risk_evaluation_receives_findings_from_analysis(self, asl):
        params = asl["States"]["RiskEvaluation"]["Parameters"]
        assert params["findings.$"] == "$.analysis.findings"

    def test_build_result_receives_evaluation_outputs(self, asl):
        params = asl["States"]["BuildResult"]["Parameters"]
        assert params["findings_with_risk.$"] == "$.evaluation.findings_with_risk"
        assert params["zt_report.$"] == "$.evaluation.zt_report"
        assert params["gate.$"] == "$.evaluation.gate"
        assert params["recommendations.$"] == "$.evaluation.recommendations"


class TestTemplate:
    @pytest.fixture
    def template(self):
        path = os.path.join(INFRA_DIR, "template.yaml")
        # CloudFormation templates use custom YAML tags (!Sub, !Ref, !GetAtt, etc.)
        loader = yaml.SafeLoader
        loader.add_multi_constructor("!",
            lambda l, suffix, n: l.construct_scalar(n) if n.id == 'scalar' else (l.construct_mapping(n) if n.id == 'mapping' else l.construct_sequence(n)))
        with open(path) as f:
            return yaml.load(f, Loader=loader)

    def test_parseable_yaml(self, template):
        assert isinstance(template, dict)

    def test_has_transform(self, template):
        assert "AWS::Serverless-2016-10-31" in template.get("Transform", "")

    def test_four_lambda_functions(self, template):
        resources = template["Resources"]
        lambdas = [k for k, v in resources.items() if v["Type"] == "AWS::Serverless::Function"]
        assert len(lambdas) == 4

    def test_dynamodb_table_exists(self, template):
        resources = template["Resources"]
        tables = [k for k, v in resources.items() if v["Type"] == "AWS::DynamoDB::Table"]
        assert len(tables) == 1

    def test_state_machine_is_express(self, template):
        sm = template["Resources"]["AssessmentWorkflow"]
        assert sm["Properties"]["Type"] == "EXPRESS"

    def test_cloudfront_has_two_origins(self, template):
        cf = template["Resources"]["CloudFrontDistribution"]
        origins = cf["Properties"]["DistributionConfig"]["Origins"]
        assert len(origins) == 2

    def test_s3_bucket_blocks_public(self, template):
        bucket = template["Resources"]["FrontendBucket"]
        block = bucket["Properties"]["PublicAccessBlockConfiguration"]
        assert block["BlockPublicAcls"] is True

    def test_pitr_enabled(self, template):
        table = template["Resources"]["AssessmentsTable"]
        pitr = table["Properties"]["PointInTimeRecoverySpecification"]
        assert pitr["PointInTimeRecoveryEnabled"] is True

    def test_lambda_handler_paths(self, template):
        """Each Lambda should have Handler: handler.handler (module.function)."""
        for name in ["ValidateFunction", "ThreatAnalysisFunction", "RiskEvaluationFunction", "BuildResultFunction"]:
            handler = template["Resources"][name]["Properties"]["Handler"]
            assert handler == "handler.handler", f"{name} has wrong handler: {handler}"

    def test_lambda_code_uri_per_function(self, template):
        """Each Lambda should have its own CodeUri pointing to its directory."""
        for name in ["ValidateFunction", "ThreatAnalysisFunction", "RiskEvaluationFunction", "BuildResultFunction"]:
            code_uri = template["Resources"][name]["Properties"]["CodeUri"]
            assert "lambdas/" in code_uri, f"{name} CodeUri doesn't point to lambdas/: {code_uri}"

    def test_lambdas_have_data_dir_env(self, template):
        """Each Lambda should have DATA_DIR environment variable."""
        for name in ["ValidateFunction", "ThreatAnalysisFunction", "RiskEvaluationFunction", "BuildResultFunction"]:
            env = template["Resources"][name]["Properties"]["Environment"]["Variables"]
            assert "DATA_DIR" in env, f"{name} missing DATA_DIR"

    def test_cloudfront_api_behavior_no_cache(self, template):
        """API behavior must disable caching."""
        cf = template["Resources"]["CloudFrontDistribution"]
        behaviors = cf["Properties"]["DistributionConfig"]["CacheBehaviors"]
        api_behavior = [b for b in behaviors if b["PathPattern"] == "/api/*"]
        assert len(api_behavior) == 1
        # CachingDisabled policy ID
        assert api_behavior[0]["CachePolicyId"] == "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    def test_cloudfront_api_allows_post(self, template):
        """API behavior must allow POST method."""
        cf = template["Resources"]["CloudFrontDistribution"]
        behaviors = cf["Properties"]["DistributionConfig"]["CacheBehaviors"]
        api_behavior = [b for b in behaviors if b["PathPattern"] == "/api/*"][0]
        assert "POST" in api_behavior["AllowedMethods"]

    def test_cloudfront_api_origin_has_stage_path(self, template):
        """API Gateway origin must include OriginPath with stage."""
        cf = template["Resources"]["CloudFrontDistribution"]
        origins = cf["Properties"]["DistributionConfig"]["Origins"]
        api_origin = [o for o in origins if o["Id"] == "ApiGateway"][0]
        # OriginPath should be /${Stage}
        assert "OriginPath" in api_origin


class TestOpenAPI:
    @pytest.fixture
    def spec(self):
        path = os.path.join(INFRA_DIR, "api", "openapi.yaml")
        with open(path) as f:
            return yaml.safe_load(f)

    def test_parseable(self, spec):
        assert spec["openapi"] == "3.0.1"

    def test_has_assess_endpoint(self, spec):
        assert "/api/assess" in spec["paths"]
        assert "post" in spec["paths"]["/api/assess"]

    def test_has_response_schemas(self, spec):
        schemas = spec["components"]["schemas"]
        assert "AssessmentRequest" in schemas
        assert "AssessmentResponse" in schemas
        assert "ValidationErrorResponse" in schemas
