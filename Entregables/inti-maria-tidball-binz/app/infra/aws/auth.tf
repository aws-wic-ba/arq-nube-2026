# Identidad: Cognito User Pool (OIDC). El backend valida el JWT contra el JWKS de Cognito
# (mismo `jose` que con mock-oidc; solo cambian OIDC_ISSUER/JWKS_URI/AUDIENCE).
# Se usa SOLO User Pools (no Identity Pools): el navegador nunca recibe credenciales AWS;
# el acceso a S3 va por presigned URLs desde el backend.

resource "aws_cognito_user_pool" "pool" {
  name = "gentle-pool"

  # Password laxa para desarrollo (en prod: endurecer).
  password_policy {
    minimum_length    = 8
    require_lowercase = false
    require_uppercase = false
    require_numbers   = false
    require_symbols   = false
  }
}

# Dominio fijo del Hosted UI - issuer/authority determinista.
resource "aws_cognito_user_pool_domain" "domain" {
  domain       = var.cognito_domain
  user_pool_id = aws_cognito_user_pool.pool.id
}

# Grupo admin: el claim `cognito:groups` del token lo lee isAdmin() en el backend (RBAC).
resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "gentle"
  user_pool_id = aws_cognito_user_pool.pool.id

  generate_secret = false # cliente público (PKCE), sin secreto

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  supported_identity_providers         = ["COGNITO"]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  # USER_PASSWORD_AUTH habilita el smoke por CLI y el plan B (login propio sin Hosted UI).
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
}
