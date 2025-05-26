// src/auth/hooks/useWebAuth.ts

/**
 * @packageDocumentation
 *
 * React hook for managing the web OAuth2 PKCE flow with Amazon Cognito.
 * It provides methods to initiate the login redirect and handle the
 * callback to exchange the authorization code for tokens.
 */

import { useState } from 'react';
import * as SecureStore from '../utils/tokenStorage';
import { generatePkcePair } from '../utils/pkce';
import { buildAuthorizeUrl } from '../utils/urls';
import { exchangeCode } from '../utils/tokenClient';
import type { OAuth2Config } from '../utils/urls';

/**
 * @public
 * @category Hooks
 *
 * useWebAuth handles the OAuth2 PKCE authorization process in web environments.
 *
 * @param config - Configuration for OAuth2 endpoints and client.
 *   - domain: Your Cognito domain (e.g., `dev-xyz.auth.us-east-2.amazoncognito.com`).
 *   - clientId: The Cognito App Client ID.
 *   - redirectUri: The URI to which Cognito will redirect after authorization.
 *   - exchangeUrl: Backend endpoint to exchange the authorization code for tokens.
 *
 * @returns An object containing:
 *  - `login`: Function to redirect the browser to Cognito’s Hosted UI.
 *  - `handleRedirect`: Function to be called on the redirect callback to exchange code for tokens.
 *  - `loading`: Boolean indicating whether a token exchange is in progress.
 *
 * @example
 * ```tsx
 * const { login, handleRedirect, loading } = useWebAuth({
 *   domain:      COGNITO_DOMAIN,
 *   clientId:    COGNITO_CLIENT_ID,
 *   redirectUri,                    // e.g. 'https://app.example.com/redirect'
 *   exchangeUrl: `${API_URL}/exchange`,
 * });
 *
 * // To start login (e.g., on button click)
 * <Button onPress={login} disabled={loading}>Log in</Button>
 *
 * // In your redirect handler component or effect:
 * useEffect(() => {
 *   if (window.location.search.includes('code=')) {
 *     handleRedirect(window.location.search)
 *       .then(tokens => console.log('Logged in!', tokens))
 *       .catch(err => alert(err.message));
 *   }
 * }, [window.location.search]);
 * ```
 */
export function useWebAuth(config: OAuth2Config & { exchangeUrl: string }) {
  const [loading, setLoading] = useState(false);

  /**
   * Redirects the user’s browser to the Cognito Hosted UI
   * with PKCE challenge parameters.
   */
  async function login() {
    setLoading(true);
    const { codeVerifier, codeChallenge } = await generatePkcePair();
    sessionStorage.setItem('pkce_verifier', codeVerifier);
    const url = buildAuthorizeUrl(config, codeChallenge);
    window.location.assign(url);
  }

  /**
   * Handles the OAuth2 redirect by parsing the authorization code,
   * exchanging it for tokens via the backend, and storing those tokens.
   *
   * @param search - The URL search string (e.g., `window.location.search`).
   * @returns A promise resolving to the token response from the backend.
   * @throws Errors from failed network requests or missing parameters.
   */
  async function handleRedirect(search: string) {
    const params      = new URLSearchParams(search);
    const code        = params.get('code')!;
    const codeVerifier = sessionStorage.getItem('pkce_verifier')!;
    const tokens      = await exchangeCode(config.exchangeUrl, code, config.redirectUri, codeVerifier);
    await SecureStore.storeTokens({
      accessToken: tokens.access_token,
      idToken:     tokens.id_token,
      refreshToken:tokens.refresh_token,
      expiresIn:   tokens.expires_in,
      fetchedAt:   Date.now(),
    });
    setLoading(false);
    return tokens;
  }

  return { login, handleRedirect, loading };
}
