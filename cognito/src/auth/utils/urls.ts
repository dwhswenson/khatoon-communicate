// src/auth/utils/urls.ts

/**
 * URL builders for OAuth2 flows against Amazon Cognito.
 *
 * Provides helper functions to construct the authorization
 * and logout endpoint URLs based on a common OAuth2 configuration.
 */

/**
 * Configuration options required to build OAuth2 URLs.
 *
 * @property domain - The Cognito user-pool domain (no scheme).
 * @property clientId - The App Client ID registered with the user pool.
 * @property redirectUri - The full redirect URI for authorization callbacks.
 */
export interface OAuth2Config {
  domain: string;             // e.g. dev-xyz.auth.us-east-2.amazoncognito.com
  clientId: string;
  redirectUri: string;        // full URI
}

/**
 * Construct the full authorization URL (with PKCE parameters).
 *
 * @param config - OAuth2 configuration options.
 * @param codeChallenge - The PKCE code challenge to include.
 * @returns A URL string pointing to the Cognito /authorize endpoint.
 *
 * @example
 * ```ts
 * const url = buildAuthorizeUrl(
 *   {
 *     domain: 'myapp.auth.us-east-2.amazoncognito.com',
 *     clientId: 'abc123',
 *     redirectUri: 'https://myapp.com/redirect',
 *   },
 *   'XyZ123Challenge',
 * );
 * // => 'https://myapp.auth.us-east-2.amazoncognito.com/oauth2/authorize?response_type=code&...'
 * ```
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
 * Construct the full logout URL for Cognito.
 *
 * @param config - OAuth2 configuration options.
 * @returns A URL string pointing to the Cognito /logout endpoint.
 *
 * @example
 * ```ts
 * const logoutUrl = buildLogoutUrl({
 *   domain: 'myapp.auth.us-east-2.amazoncognito.com',
 *   clientId: 'abc123',
 *   redirectUri: 'https://myapp.com/redirect',
 * });
 * // => 'https://myapp.auth.us-east-2.amazoncognito.com/logout?client_id=abc123&logout_uri=https%3A%2F%2Fmyapp.com%2Fredirect'
 * ```
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
