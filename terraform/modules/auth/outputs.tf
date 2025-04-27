output "user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  description = "The ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.this.arn
}

output "user_pool_client_id" {
  description = "The client ID for the Cognito User Pool App Client"
  value       = aws_cognito_user_pool_client.this.id
}

output "user_pool_domain_prefix" {
  description = "The domain prefix for the Cognito User Pool"
  value       = aws_cognito_user_pool_domain.this.domain
}

# Future outputs (e.g., for Google IdP or Lambda trigger ARNs) can be added here as needed.
