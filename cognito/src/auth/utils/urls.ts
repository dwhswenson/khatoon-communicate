// src/auth/utils/urls.ts

export interface OAuth2Config {
  domain: string;             // e.g. dev-xyz.auth.us-east-2.amazoncognito.com
  clientId: string;
  redirectUri: string;        // full URI
}

/**
 * Construct the full authorize URL (with PKCE params baked in).
 */
export function buildAuthorizeUrl(
  { domain, clientId, redirectUri }: OAuth2Config,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    response_type:         'code',
    client_id:             clientId,
    redirect_uri:          redirectUri,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
    scope:                 'openid email profile',
  });
  return `https://${domain}/oauth2/authorize?${params.toString()}`;
}

/**
 * Construct the logout URL.
 */
export function buildLogoutUrl(
  { domain, clientId, redirectUri }: OAuth2Config
): string {
  const params = new URLSearchParams({
    client_id:    clientId,
    logout_uri:   redirectUri,
  });
  return `https://${domain}/logout?${params.toString()}`;
}
