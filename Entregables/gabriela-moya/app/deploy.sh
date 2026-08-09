#!/bin/bash
# ============================================================
# Secure Design Advisor — Full Deployment Script
# ============================================================
#
# Usage:
#   ./deploy.sh              Run full deployment (all phases)
#   ./deploy.sh --skip-deploy   Run phases 1-3 only (prerequisites + layer + build)
#   ./deploy.sh --verify-only   Run phase 6 only (verification against live stack)
#   ./deploy.sh --use-container Use Docker container for SAM build
#
# Prerequisites:
#   - AWS CLI v2 configured with profile/credentials for account 359932033910
#   - SAM CLI v1.x installed
#   - Python 3.11 or 3.12
#   - Region set to us-east-1: aws configure set region us-east-1
#   - jq (optional, used for JSON parsing with grep fallback)
#
# Environment:
#   Run this script from the app/ directory:
#     cd Entregables/gabriela-moya/app && ./deploy.sh
#
# Stack: sda-dev (us-east-1, account 359932033910)
# ============================================================

set -euo pipefail

# Navigate to script directory (all commands assume working directory is app/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ============================================================
# Color Output Helpers
# ============================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

section() {
    local phase="$1"
    local title="$2"
    echo ""
    echo -e "${BLUE}=== Phase ${phase}: ${title} ===${NC}"
    echo ""
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================
# Argument Parsing
# ============================================================
SKIP_DEPLOY=false
VERIFY_ONLY=false
USE_CONTAINER=false

for arg in "$@"; do
    case "$arg" in
        --skip-deploy)
            SKIP_DEPLOY=true
            ;;
        --verify-only)
            VERIFY_ONLY=true
            ;;
        --use-container)
            USE_CONTAINER=true
            ;;
        *)
            warn "Unknown argument: $arg"
            ;;
    esac
done

# ============================================================
# Configuration
# ============================================================
STACK_NAME="sda-dev"
EXPECTED_ACCOUNT="359932033910"
EXPECTED_REGION="us-east-1"

# Helper: parse JSON field (uses jq if available, falls back to python3/grep)
json_get() {
    local json="$1"
    local field="$2"
    if command -v jq &> /dev/null; then
        echo "$json" | jq -r "$field"
    else
        echo "$json" | python3 -c "import sys,json; data=json.load(sys.stdin); print(eval('data' + '$field'.replace('.','[\"').replace('[\"','[\"',1) + '\"]' if '.' in '$field' else data.get('$field'.lstrip('.'),'')));" 2>/dev/null || \
        echo "$json" | grep -oP "\"${field#.}\":\s*\"?\K[^,\"}\]]*"
    fi
}

# Helper: get CloudFormation output value by key
get_stack_output() {
    local key="$1"
    aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$EXPECTED_REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue" \
        --output text 2>/dev/null || echo ""
}

# ============================================================
# --verify-only: Skip directly to Phase 6
# ============================================================
if [[ "$VERIFY_ONLY" == "true" ]]; then
    info "Running verification only (--verify-only)"
    info "Fetching stack outputs for verification..."

    FRONTEND_URL=$(get_stack_output "FrontendUrl")
    API_URL=$(get_stack_output "ApiUrl")
    TABLE_NAME=$(get_stack_output "TableName")

    if [[ -z "$FRONTEND_URL" ]]; then
        error "Could not retrieve FrontendUrl from stack $STACK_NAME. Is the stack deployed?"
    fi

    # Jump directly to Phase 6
    # (Phase 6 code is below, we use a function approach via goto-equivalent)
fi

# ============================================================
# Phase 1: Prerequisites
# ============================================================
if [[ "$VERIFY_ONLY" != "true" ]]; then

section 1 "Prerequisites"

# --- AWS CLI version check (must be v2.x) ---
if ! command -v aws &> /dev/null; then
    error "AWS CLI not found. Install AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
fi

AWS_CLI_VERSION=$(aws --version 2>&1)
if [[ ! "$AWS_CLI_VERSION" == *"aws-cli/2"* ]]; then
    error "AWS CLI v2.x required. Found: $AWS_CLI_VERSION"
fi
success "AWS CLI v2 detected: $AWS_CLI_VERSION"

# --- SAM CLI version check (must be v1.x) ---
if ! command -v sam &> /dev/null; then
    error "SAM CLI not found. Install SAM CLI v1: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
fi

SAM_CLI_VERSION=$(sam --version 2>&1)
if [[ ! "$SAM_CLI_VERSION" == *"1."* ]]; then
    error "SAM CLI v1.x required. Found: $SAM_CLI_VERSION"
fi
success "SAM CLI v1 detected: $SAM_CLI_VERSION"

# --- Python 3.11+ check ---
if ! command -v python3 &> /dev/null; then
    error "Python 3 not found. Install Python 3.11 or 3.12: https://www.python.org/downloads/"
fi

PYTHON_VERSION=$(python3 --version 2>&1)
if [[ ! "$PYTHON_VERSION" == *"3.11"* ]] && [[ ! "$PYTHON_VERSION" == *"3.12"* ]]; then
    error "Python 3.11 or 3.12 required. Found: $PYTHON_VERSION"
fi
success "Python version OK: $PYTHON_VERSION"

# --- AWS identity and region check ---
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>&1) || \
    error "Failed to get AWS identity. Ensure credentials are configured: aws configure"

if [[ "$AWS_ACCOUNT" != "$EXPECTED_ACCOUNT" ]]; then
    error "Wrong AWS account. Expected: $EXPECTED_ACCOUNT, Got: $AWS_ACCOUNT"
fi
success "AWS Account verified: $AWS_ACCOUNT"

AWS_REGION=$(aws configure get region 2>&1) || AWS_REGION=""
if [[ "$AWS_REGION" != "$EXPECTED_REGION" ]]; then
    error "Wrong AWS region. Expected: $EXPECTED_REGION, Got: ${AWS_REGION:-<not set>}. Run: aws configure set region us-east-1"
fi
success "AWS Region verified: $AWS_REGION"

# --- Prerequisites summary ---
echo ""
info "─────────────────────────────────────────"
info "All prerequisites validated successfully!"
info "─────────────────────────────────────────"
info "  AWS CLI:  $AWS_CLI_VERSION"
info "  SAM CLI:  $SAM_CLI_VERSION"
info "  Python:   $PYTHON_VERSION"
info "  Account:  $AWS_ACCOUNT"
info "  Region:   $AWS_REGION"
info "─────────────────────────────────────────"

# ============================================================
# Phase 2: Layer Preparation
# ============================================================
section 2 "Layer Preparation"

info "Running prepare_layer.py..."
if ! python3 infrastructure/prepare_layer.py; then
    error "Layer preparation failed. Check infrastructure/prepare_layer.py for errors."
fi

# Validate layer structure
if [[ ! -d "layer_content/python/engine" ]]; then
    error "Layer preparation incomplete: layer_content/python/engine/ not found"
fi

if [[ ! -d "layer_content/data" ]]; then
    error "Layer preparation incomplete: layer_content/data/ not found"
fi

# Report file counts
PY_COUNT=$(find layer_content/python/engine -name "*.py" | wc -l)
JSON_COUNT=$(find layer_content/data -name "*.json" | wc -l)

success "Layer prepared successfully"
info "  Python files (engine): $PY_COUNT"
info "  JSON data files:       $JSON_COUNT"

# ============================================================
# Phase 3: SAM Validate & Build
# ============================================================
section 3 "SAM Validate & Build"

# --- SAM Validate ---
info "Validating SAM template..."
if ! sam validate -t infrastructure/template.yaml --region "$EXPECTED_REGION"; then
    error "SAM template validation failed. Check infrastructure/template.yaml for syntax errors."
fi
success "SAM template is valid"

# --- SAM Build ---
info "Building SAM application..."
BUILD_CMD="sam build -t infrastructure/template.yaml"

if [[ "$USE_CONTAINER" == "true" ]]; then
    BUILD_CMD="$BUILD_CMD --use-container"
    info "Using container-based build (--use-container)"
fi

if ! $BUILD_CMD; then
    error "SAM build failed. Common causes:\n  - Missing dependencies in requirements.txt\n  - Invalid template references\n  - Python version mismatch\n  Check the build output above for details."
fi

# Validate build output
if [[ ! -d ".aws-sam/build" ]]; then
    error "SAM build directory .aws-sam/build/ not found after build"
fi

BUILD_FUNCTIONS=$(ls .aws-sam/build/ 2>/dev/null | grep -v template.yaml | wc -l)
success "SAM build completed ($BUILD_FUNCTIONS functions built)"

# --- Exit if --skip-deploy ---
if [[ "$SKIP_DEPLOY" == "true" ]]; then
    echo ""
    info "─────────────────────────────────────────"
    info "--skip-deploy: Stopping after build."
    info "Phases 1-3 completed successfully."
    info "Run without --skip-deploy to deploy."
    info "─────────────────────────────────────────"
    exit 0
fi

# ============================================================
# Phase 4: SAM Deploy
# ============================================================
section 4 "SAM Deploy"

info "Deploying stack: $STACK_NAME"
info "Config: infrastructure/samconfig.toml"
info "This may take several minutes..."
echo ""

if ! sam deploy --config-file infrastructure/samconfig.toml --no-confirm-changeset; then
    echo ""
    error "SAM deploy failed.\n\n  Troubleshooting:\n  - Check CloudFormation events:\n    https://console.aws.amazon.com/cloudformation/home?region=${EXPECTED_REGION}#/stacks/events?filteringStatus=active&filteringText=${STACK_NAME}\n  - Run: aws cloudformation describe-stack-events --stack-name $STACK_NAME --region $EXPECTED_REGION --max-items 10\n  - Common causes: IAM permissions, resource name conflicts, quota limits"
fi

success "Stack deployed successfully: $STACK_NAME"

# --- Extract CloudFormation outputs ---
info "Extracting stack outputs..."

FRONTEND_URL=$(get_stack_output "FrontendUrl")
API_URL=$(get_stack_output "ApiUrl")
WORKFLOW_ARN=$(get_stack_output "WorkflowArn")
TABLE_NAME=$(get_stack_output "TableName")

if [[ -z "$FRONTEND_URL" ]]; then
    warn "FrontendUrl output not found in stack. Check CloudFormation outputs."
fi

# --- Print deployment summary ---
echo ""
info "─────────────────────────────────────────"
info "Stack Outputs:"
info "─────────────────────────────────────────"
info "  FrontendUrl:  ${FRONTEND_URL:-<not available>}"
info "  ApiUrl:       ${API_URL:-<not available>}"
info "  WorkflowArn:  ${WORKFLOW_ARN:-<not available>}"
info "  TableName:    ${TABLE_NAME:-<not available>}"
info "─────────────────────────────────────────"

# ============================================================
# Phase 5: Frontend Upload
# ============================================================
section 5 "Frontend Upload"

# Determine S3 bucket name from stack outputs or use known name
BUCKET_NAME=$(get_stack_output "FrontendBucketName")
if [[ -z "$BUCKET_NAME" ]]; then
    BUCKET_NAME="sda-frontend-dev-${EXPECTED_ACCOUNT}"
    warn "FrontendBucketName not in stack outputs, using: $BUCKET_NAME"
fi

info "Uploading frontend to s3://$BUCKET_NAME"

# Sync with content-type overrides per file type
# First: sync all files
aws s3 sync frontend/ "s3://$BUCKET_NAME" --delete \
    --exclude "*.html" --exclude "*.css" --exclude "*.js" --exclude "*.json"
success "Synced static assets"

# HTML files
aws s3 sync frontend/ "s3://$BUCKET_NAME" \
    --exclude "*" --include "*.html" \
    --content-type "text/html; charset=utf-8"
success "Synced HTML files"

# CSS files
aws s3 sync frontend/ "s3://$BUCKET_NAME" \
    --exclude "*" --include "*.css" \
    --content-type "text/css; charset=utf-8"
success "Synced CSS files"

# JS files
aws s3 sync frontend/ "s3://$BUCKET_NAME" \
    --exclude "*" --include "*.js" \
    --content-type "application/javascript; charset=utf-8"
success "Synced JavaScript files"

# JSON files (if any in frontend)
aws s3 sync frontend/ "s3://$BUCKET_NAME" \
    --exclude "*" --include "*.json" \
    --content-type "application/json"
success "Synced JSON files"

info "Frontend upload complete"

# --- CloudFront invalidation ---
info "Invalidating CloudFront cache..."

# Get CloudFront distribution ID from stack outputs
DIST_ID=$(get_stack_output "CloudFrontDistributionId")

# Fallback: query CloudFront distributions if not in stack outputs
if [[ -z "$DIST_ID" ]]; then
    DIST_ID=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Origins.Items[?Id=='S3-${BUCKET_NAME}' || contains(DomainName,'${BUCKET_NAME}')]].Id" \
        --output text 2>/dev/null | head -1)
fi

if [[ -z "$DIST_ID" ]]; then
    warn "CloudFront distribution ID not found. Skipping invalidation."
    warn "You may need to manually invalidate or wait for TTL expiration."
else
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DIST_ID" \
        --paths "/*" \
        --query "Invalidation.Id" \
        --output text)
    success "CloudFront invalidation created: $INVALIDATION_ID"
    info "Waiting 5 seconds for propagation..."
    sleep 5
fi

fi  # End of VERIFY_ONLY != true block

# ============================================================
# Phase 6: Verification
# ============================================================
section 6 "Verification"

# Ensure we have stack outputs (either from deploy or from --verify-only fetch)
if [[ -z "${FRONTEND_URL:-}" ]]; then
    FRONTEND_URL=$(get_stack_output "FrontendUrl")
fi
if [[ -z "${API_URL:-}" ]]; then
    API_URL=$(get_stack_output "ApiUrl")
fi
if [[ -z "${TABLE_NAME:-}" ]]; then
    TABLE_NAME=$(get_stack_output "TableName")
fi

if [[ -z "$FRONTEND_URL" ]]; then
    error "Cannot verify: FrontendUrl not available. Is the stack deployed?"
fi

VERIFY_PASS=0
VERIFY_FAIL=0

# --- 8.1: Frontend verification ---
info "Testing frontend: $FRONTEND_URL"
FRONTEND_HTTP=$(curl -s -o /tmp/sda_frontend_response.html -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null) || FRONTEND_HTTP="000"

if [[ "$FRONTEND_HTTP" == "200" ]] && grep -qi "<html" /tmp/sda_frontend_response.html 2>/dev/null; then
    success "Frontend: HTTP 200, valid HTML response"
    VERIFY_PASS=$((VERIFY_PASS + 1))
else
    warn "Frontend: HTTP $FRONTEND_HTTP (expected 200 with HTML content)"
    VERIFY_FAIL=$((VERIFY_FAIL + 1))
fi

# --- 8.2: API verification ---
# Determine the assess endpoint URL
ASSESS_URL="${FRONTEND_URL%/}/api/assess"
info "Testing API: POST $ASSESS_URL"

API_HTTP=$(curl -s -o /tmp/sda_api_response.json -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d @infrastructure/test-payload.json \
    "$ASSESS_URL" 2>/dev/null) || API_HTTP="000"

if [[ "$API_HTTP" == "200" ]]; then
    success "API: HTTP 200 response"
    VERIFY_PASS=$((VERIFY_PASS + 1))
else
    warn "API: HTTP $API_HTTP (expected 200)"
    VERIFY_FAIL=$((VERIFY_FAIL + 1))
fi

# --- 8.3: Response validation ---
info "Validating API response fields..."
API_RESPONSE=$(cat /tmp/sda_api_response.json 2>/dev/null || echo "{}")

HAS_ASSESSMENT_ID=false
HAS_RESULT=false

if command -v jq &> /dev/null; then
    [[ $(echo "$API_RESPONSE" | jq -r '.assessment_id // empty' 2>/dev/null) ]] && HAS_ASSESSMENT_ID=true
    [[ $(echo "$API_RESPONSE" | jq -r '.result // empty' 2>/dev/null) ]] && HAS_RESULT=true
else
    echo "$API_RESPONSE" | grep -q '"assessment_id"' && HAS_ASSESSMENT_ID=true
    echo "$API_RESPONSE" | grep -q '"result"' && HAS_RESULT=true
fi

if [[ "$HAS_ASSESSMENT_ID" == "true" && "$HAS_RESULT" == "true" ]]; then
    success "Response contains assessment_id and result fields"
    VERIFY_PASS=$((VERIFY_PASS + 1))
elif [[ "$API_HTTP" != "200" ]]; then
    warn "Response validation skipped (API returned HTTP $API_HTTP)"
    VERIFY_FAIL=$((VERIFY_FAIL + 1))
else
    warn "Response missing expected fields (assessment_id and/or result)"
    VERIFY_FAIL=$((VERIFY_FAIL + 1))
fi

# --- 8.4: DynamoDB verification ---
info "Checking DynamoDB for COMPLETED record..."

if [[ -n "${TABLE_NAME:-}" ]]; then
    DDB_RESULT=$(aws dynamodb scan \
        --table-name "$TABLE_NAME" \
        --filter-expression "#s = :status" \
        --expression-attribute-names '{"#s": "status"}' \
        --expression-attribute-values '{":status": {"S": "COMPLETED"}}' \
        --select COUNT \
        --region "$EXPECTED_REGION" \
        --query "Count" \
        --output text 2>/dev/null) || DDB_RESULT="0"

    if [[ "$DDB_RESULT" -gt 0 ]]; then
        success "DynamoDB: $DDB_RESULT COMPLETED record(s) found in $TABLE_NAME"
        VERIFY_PASS=$((VERIFY_PASS + 1))
    else
        warn "DynamoDB: No COMPLETED records found in $TABLE_NAME"
        VERIFY_FAIL=$((VERIFY_FAIL + 1))
    fi
else
    warn "DynamoDB: TableName not available, skipping check"
    VERIFY_FAIL=$((VERIFY_FAIL + 1))
fi

# --- 8.5: Verification summary ---
echo ""
TOTAL=$((VERIFY_PASS + VERIFY_FAIL))
info "─────────────────────────────────────────"
info "Verification Summary"
info "─────────────────────────────────────────"
echo -e "  ${GREEN}Passed: $VERIFY_PASS / $TOTAL${NC}"
if [[ $VERIFY_FAIL -gt 0 ]]; then
    echo -e "  ${RED}Failed: $VERIFY_FAIL / $TOTAL${NC}"
fi
info "─────────────────────────────────────────"

# --- 8.6: Troubleshooting hints ---
if [[ $VERIFY_FAIL -gt 0 ]]; then
    echo ""
    warn "Troubleshooting hints:"
    echo "  • CloudFront propagation can take 1-5 minutes after invalidation"
    echo "  • API Gateway 403: Check that the API stage is deployed and CORS is configured"
    echo "  • Lambda timeout: Check CloudWatch Logs for the function execution"
    echo "  • DynamoDB empty: Verify Step Functions execution completed (check CloudWatch)"
    echo "  • Run again with --verify-only after a few minutes"
    echo ""
    echo "  CloudFormation console:"
    echo "    https://console.aws.amazon.com/cloudformation/home?region=${EXPECTED_REGION}#/stacks?filteringText=${STACK_NAME}"
    echo ""
fi

# --- Final status ---
if [[ $VERIFY_FAIL -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Deployment completed and verified! 🎉${NC}"
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Frontend: $FRONTEND_URL${NC}"
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo ""
else
    echo ""
    warn "Deployment completed with $VERIFY_FAIL verification warning(s)."
    warn "The stack is deployed but some checks did not pass."
    warn "Review the warnings above and re-run with --verify-only after fixes."
fi
