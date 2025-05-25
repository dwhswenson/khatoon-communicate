// src/auth/utils/redirect.ts

/**
 * Given the `?code=…` query string, returns the
 * authorization code and the PKCE verifier you
 * previously stored in sessionStorage.
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
