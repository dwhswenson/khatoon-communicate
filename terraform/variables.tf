variable "dev_version" {
  description = "The version of the development environment."
  type        = string
  default     = "dev2"
}

variable "test_phone" {
  description = "The phone number to use for testing."
  type        = string
}

variable "twilio_phone_number" {
  description = "The Twilio phone number to use for sending SMS messages."
  type        = string
}

variable "twilio_account_sid" {
  description = "The Twilio account SID."
  type        = string
}

variable "twilio_auth_token" {
  description = "The Twilio authentication token."
  type        = string
}

variable "aws_region" {
  description = "AWS Region to deploy resources."
  type        = string
}

variable "project_name" {
  description = "The project name used for naming resources."
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., production, staging)."
  type        = string
  default     = "dev"
}

variable "dynamodb_sms_table_name" {
  description = "Name for the DynamoDB table to store SMS messages."
  type        = string
  default     = "SMSMessages"
}

variable "dynamodb_voice_table_name" {
  description = "Name for the DynamoDB table to store Voice messages."
  type        = string
  default     = "VoiceMessages"
}

variable "voicemail_bucket_name" {
  description = "Name for the S3 bucket to store voicemail recordings."
  type        = string
  default     = "khatoon-voicemail-bucket-dev"
}

variable "lambda_container_image_uri" {
  description = "The ECR image URI for the Lambda functions."
  type        = string
}

variable "sms_handler_handler" {
  description = "The handler for the SMS Lambda function (e.g., sms_handler.lambda_handler)."
  type        = string
  default     = "sms_handler.lambda_handler"
}

variable "voice_handler_handler" {
  description = "The handler for the Voice Lambda function (e.g., voice_handler.lambda_handler)."
  type        = string
  default     = "voice_handler.lambda_handler"
}
