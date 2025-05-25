// src/auth/hooks/useWebAuth.ts
import { useState } from 'react';
import * as SecureStore from '../utils/tokenStorage';
import { generatePkcePair } from '../utils/pkce';
import { buildAuthorizeUrl } from '../utils/urls';
import { exchangeCode } from '../utils/tokenClient';
import type { OAuth2Config } from '../utils/urls';

export function useWebAuth(config: OAuth2Config & { exchangeUrl: string }) {
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    const { codeVerifier, codeChallenge } = await generatePkcePair();
    sessionStorage.setItem('pkce_verifier', codeVerifier);
    const url = buildAuthorizeUrl(config, codeChallenge);
    window.location.assign(url);
  }

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
