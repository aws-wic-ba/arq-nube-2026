variable "emulated" {
  description = "true = MiniStack (emulador local); false = AWS real"
  type        = bool
  default     = true
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "ministack_endpoint" {
  description = "Endpoint de MiniStack visto por OpenTofu (host)"
  type        = string
  default     = "http://localhost:4566"
}

variable "ministack_internal_endpoint" {
  description = "Endpoint de MiniStack en la red docker (lo usa la Lambda para llegar a DynamoDB/S3)"
  type        = string
  default     = "http://ministack:4566"
}

variable "ministack_public_endpoint" {
  description = "Endpoint que ve el NAVEGADOR (presigned S3, API GW, Cognito)"
  type        = string
  default     = "http://localhost:4566"
}

variable "table_name" {
  type    = string
  default = "gentle"
}

variable "bucket_name" {
  type    = string
  default = "gentle-media"
}

variable "api_custom_id" {
  description = "ID fijo del API GW (tag ms-custom-id de MiniStack) para URL determinista"
  type        = string
  default     = "gentleapi"
}

variable "cognito_domain" {
  description = "Dominio fijo del Hosted UI de Cognito → issuer/authority determinista"
  type        = string
  default     = "gentle"
}

variable "callback_urls" {
  description = "URLs permitidas para redirección tras login exitoso"
  type        = list(string)
  default     = ["http://localhost:3000/auth/callback"]
}

variable "logout_urls" {
  description = "URLs permitidas para redirección tras logout"
  type        = list(string)
  default     = ["http://localhost:3000"]
}
