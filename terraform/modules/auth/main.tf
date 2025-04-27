resource "aws_cognito_user_pool" "this" {
  name = "${var.user_pool_name}-${var.env}"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Email configuration using defaults with basic customization.
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"  
    email_subject        = "Verify your email for ${var.user_pool_name}"
    email_message        = "Your verification code is {####}"
  }

  # Password policy configuration.
  # Future work: Adjust and add more complexity as needed.
  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }

  # Lambda triggers can be hooked up here in the future if custom workflows are needed.
  # Example:
  # lambda_config {
  #   pre_sign_up      = aws_lambda_function.pre_sign_up_function.arn
  #   post_confirmation = aws_lambda_function.post_confirmation_function.arn
  # }

  # Future MFA configuration (disabled for now):
  # mfa_configuration = "ON"
  # sms_configuration {
  #   external_id   = "<YOUR_EXTERNAL_ID>"
  #   sns_caller_arn = "<YOUR_SNS_CALLER_ARN>"
  # }

  tags = {
    Environment = var.env
    ManagedBy   = "Terraform"
  }
}

resource "aws_cognito_user_pool_domain" "this" {
  domain      = "${var.env}-khatoon-cuisine"
  user_pool_id = aws_cognito_user_pool.this.id
}

resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.app_client_name}-${var.env}"
  user_pool_id = aws_cognito_user_pool.this.id

  # This client is public (no secret) for mobile applications.
  generate_secret = false

  # Token validity settings; adjust according to your security requirements.
  access_token_validity  = 1     # in hours
  id_token_validity      = 1     # in hours
  refresh_token_validity = 1440  # in minutes (1 day)

  # Callback and logout URLs for hosted UI can be defined if ever needed.
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = [
    "email",
    "openid",
    "profile",
    "aws.cognito.signin.user.admin"
  ]

  supported_identity_providers = ["COGNITO"]
  prevent_user_existence_errors = "ENABLED"

  # Future IdP (Google) configuration note:
  # When var.allow_google_idp is true, you can add the necessary configuration
  # for Google as an external identity provider here or in a separate identity provider block.
  #
  # Example (future use):
  # resource "aws_cognito_identity_provider" "google" {
  #   count           = var.allow_google_idp ? 1 : 0
  #   provider_name   = "Google"
  #   provider_type   = "Google"
  #   user_pool_id    = aws_cognito_user_pool.this.id
  #   attribute_mapping = {
  #     email = "email"
  #     name  = "name"
  #   }
  #   provider_details = {
  #     client_id     = "<GOOGLE_CLIENT_ID>"
  #     client_secret = "<GOOGLE_CLIENT_SECRET>"
  #     authorize_scopes = "profile email"
  #   }
  # }
  #
}

# current AWS region
data "aws_region" "current" {}

locals {
  cognito_full_domain = "${aws_cognito_user_pool_domain.this.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
}

# Note on rate limiting:
# While this module focuses on Cognito configuration,
# API Gateway rate limiting and other defensive measures (e.g., via AWS WAF)
# should be implemented in the API Gateway module.
#
# Additionally, you can use CloudWatch metrics to monitor usage and set alarms accordingly.

# AUTH FLOW (lambdas and gateway integration)

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name               = "token-exchange-role-${var.env}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "token_exchange" {
  function_name = "token-exchange-${var.env}"
  package_type  = "Image"
  image_uri     = var.auth_lambda_image_uri
  role          = aws_iam_role.lambda_exec.arn
  source_code_hash = var.dev_version  # HACK

  # Override the container CMD to invoke token_exchange.lambda_handler
  image_config {
    command = ["token_exchange.lambda_handler"]
  }

  environment {
    variables = {
      COGNITO_DOMAIN    = local.cognito_full_domain
      COGNITO_CLIENT_ID = aws_cognito_user_pool_client.this.id
      DEV_VERSION      = var.dev_version
    }
  }
}

data "aws_apigatewayv2_api" "existing" {
  api_id = var.http_api_id
}

resource "aws_apigatewayv2_integration" "token_exchange" {
  api_id                 = var.http_api_id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.token_exchange.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "token_exchange" {
  api_id    = var.http_api_id
  route_key = "POST /exchange"
  target    = "integrations/${aws_apigatewayv2_integration.token_exchange.id}"
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowInvokeFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.token_exchange.function_name
  principal     = "apigateway.amazonaws.com"
  # format: {api_execution_arn}/*/{method}/{route}
  source_arn    = "${data.aws_apigatewayv2_api.existing.execution_arn}/*/POST/exchange"
}
