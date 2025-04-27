import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    COGNITO_DOMAIN:    process.env.cognito_domain,
    COGNITO_CLIENT_ID: process.env.cognito_user_pool_client_id,
    COGNITO_USER_POOL_ID: process.env.cognito_user_pool_id,
    EXCHANGE_API_URL:  process.env.api_endpoint,
  }
});
