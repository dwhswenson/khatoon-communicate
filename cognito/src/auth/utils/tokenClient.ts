// src/auth/utils/tokenClient.ts

/**
 * tokenClient.ts
 *
 * A low-level HTTP client for exchanging OAuth2 authorization codes for tokens.
 * This module communicates with your backend token-exchange endpoint and parses
 * the JSON response into a typed `TokenResponse` object.
 */

/**
 * Raw shape of the JSON payload returned by the token exchange endpoint.
 *
 * @remarks
 * - `access_token` is the OAuth2 access token.
 * - `id_token` is the JWT carrying user identity claims.
 * - `refresh_token` is the long-lived token used to refresh the access token.
 * - `expires_in` is the lifetime of the access token in seconds.
 */
export interface TokenResponse {
  access_token:  string;
  id_token:      string;
  refresh_token: string;
  expires_in:    number;
}

/**
 * Exchange an authorization code (with PKCE verifier) for a set of OAuth2 tokens.
 *
 * @param apiUrl - Full URL of your token-exchange endpoint (e.g. `${EXCHANGE_API_URL}/exchange`).
 * @param code - The authorization code returned from the OAuth2 authorization endpoint.
 * @param redirectUri - The redirect URI that was used during the authorization request.
 * @param codeVerifier - The PKCE code verifier that corresponds to the previously generated challenge.
 *
 * @returns A promise that resolves to a {@link TokenResponse} containing the raw OAuth2 tokens.
 *
 * @throws If the HTTP response has a non-OK status, an Error will be thrown containing
 *         the status code and any returned error text.
 *
 * @example
 * ```ts
 * const tokens = await exchangeCode(
 *   'https://api.example.com/exchange',
 *   authorizationCode,
 *   'myapp://redirect',
 *   storedCodeVerifier
 * );
 * console.log(tokens.access_token);
 * ```
 */
export async function exchangeCode(
  apiUrl:     string,   // e.g. `${EXCHANGE_API_URL}/exchange`
  code:       string,
  redirectUri: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const res = await fetch(apiUrl, {
    method:  'POST',
    headers: { 'Content-Type':'application/json' },
    body:    JSON.stringify({
        code,
        redirectUri,
        codeVerifier
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed ${res.status}: ${text}`);
  }
  return res.json();
}
