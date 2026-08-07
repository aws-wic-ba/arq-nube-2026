#!/usr/bin/env bash
# Emite las variables NEXT_PUBLIC_* del frontend para el build AWS-emulado, leídas de
# `tofu output` (pool id / client id son dinámicos por apply). Uso:
#   eval "$(cd infra/aws && ./frontend-env.sh)"
#   docker compose -f docker-compose.aws.yml up -d --build frontend
set -euo pipefail
cd "$(dirname "$0")"

POOL=$(tofu output -raw user_pool_id)
CLIENT=$(tofu output -raw cognito_client_id)
API=$(tofu output -raw api_url)

# Split-horizon Cognito: authority = issuer formato AWS (validación); metadata = MiniStack.
echo "export NEXT_PUBLIC_API_URL='${API%/}'"
echo "export NEXT_PUBLIC_OIDC_AUTHORITY='https://cognito-idp.us-east-1.amazonaws.com/${POOL}'"
echo "export NEXT_PUBLIC_OIDC_METADATA_URL='http://localhost:4566/${POOL}/.well-known/openid-configuration'"
echo "export NEXT_PUBLIC_OIDC_CLIENT_ID='${CLIENT}'"
