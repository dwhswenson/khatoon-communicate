variable "env" {
  description = "The environment in which to deploy (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "dev_version" {
  description = "Version for development, allows us to force lambda deploys"
  type        = string
}

variable "user_pool_name" {
  description = "The base name for the Cognito user pool"
  type        = string
}

variable "app_client_name" {
  description = "The base name for the Cognito user pool app client"
  type        = string
}

variable "callback_urls" {
  description = "List of callback URLs for the Cognito app client"
  type        = list(string)
  default     = []
}

variable "logout_urls" {
  description = "List of logout URLs for the Cognito app client"
  type        = list(string)
  default     = []
}

variable "auth_lambda_image_uri" {
  description = "The URI of the Lambda function image for authentication"
  type        = string
}

variable "http_api_id" {
  description = "The ID of the HTTP API Gateway to associate with the Cognito user pool"
  type        = string
}

variable "allow_google_idp" {
  description = "Flag to indicate if future Google IdP integration is enabled"
  type        = bool
  default     = false
}

# Additional variables (e.g., for password policies, MFA settings, or Lambda trigger ARNs) 
# can be added here in the future.
