// src/auth/utils/redirect.ts

/**
 * @module redirectUtils
 *
 * @description
 * Utilities for extracting OAuth2 redirect parameters from the browser's
 * URL query string, and retrieving the stored PKCE verifier from sessionStorage.
 *
 * This module helps web-based auth flows parse the `code` and correlate it
 * with the previously generated PKCE verifier, so that token exchange can proceed.
 */

/**
 * Given the full query string from a redirect URI (e.g. `?code=...&state=...`),
 * extracts the OAuth2 authorization code and the PKCE code verifier.
 * The verifier must have been stored earlier under `sessionStorage["pkce_verifier"]`.
 *
 * @param search - The `window.location.search` string, including the leading `?`.
 * @returns An object containing:
 *   - `code`: the authorization code returned by the OAuth2 provider.
 *   - `codeVerifier`: the PKCE code verifier originally generated.
 *
 * @throws {Error} If no `code` parameter is found in the query string.
 * @throws {Error} If no PKCE verifier is present in sessionStorage.
 */
export function parseRedirectParams(search: string): {
  code: string;
  codeVerifier: string;
} {
  const params = new URLSearchParams(search);
  const code = params.get('code');
  if (!code) {
    throw new Error('Missing code in redirect URL');
  }
  const codeVerifier = sessionStorage.getItem('pkce_verifier');
  if (!codeVerifier) {
    throw new Error('No PKCE verifier in sessionStorage');
  }
  return { code, codeVerifier };
}
