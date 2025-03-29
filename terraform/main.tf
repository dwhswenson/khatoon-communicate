provider "aws" {
  region = var.aws_region
}

# use user_info.yaml to store user data; each user in format
# +13121234567:  # phone number
#   name: "John Doe"
#   lang: "en"  # language code
locals {
  user_info = jsonencode(yamldecode(file("${path.module}/user_info.yaml")))
}

module "sms" {
  source                     = "./modules/sms"
  project_name               = var.project_name
  environment                = var.environment
  dynamodb_sms_table_name    = var.dynamodb_sms_table_name
  lambda_container_image_uri = var.lambda_container_image_uri
  sms_handler_handler        = var.sms_handler_handler

  # below here is only for group chat functions, not webapp for Khatoon
  dev_version                = var.dev_version
  user_info                  = local.user_info
  test_phone                 = var.test_phone
  twilio_phone_number        = var.twilio_phone_number
  twilio_account_sid         = var.twilio_account_sid
  twilio_auth_token          = var.twilio_auth_token
}

module "voice" {
  source                     = "./modules/voice"
  project_name               = var.project_name
  environment                = var.environment
  dynamodb_voice_table_name  = var.dynamodb_voice_table_name
  voicemail_bucket_name      = var.voicemail_bucket_name
  lambda_container_image_uri = var.lambda_container_image_uri
  voice_handler_handler      = var.voice_handler_handler
}

module "amazon_translate" {
  source           = "./modules/amazon-translate"
  project_name     = var.project_name
  lambda_role_name = module.sms.sms_lambda_role_name
}

output "sms_function_url" {
  description = "The Lambda Function URL for SMS processing"
  value       = module.sms.sms_function_url
}

output "voice_function_url" {
  description = "The Lambda Function URL for Voice processing"
  value       = module.voice.voice_function_url
}

output "dynamodb_sms_table" {
  description = "The DynamoDB Table Name for SMS processing"
  value       = module.sms.sms_dynamodb_table
}
