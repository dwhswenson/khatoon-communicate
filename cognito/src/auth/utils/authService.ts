// src/auth/utils/authService.ts
// pure‐TS orchestration, easy to unit‐test:
export async function exchangeCodeAndStore(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<StoredTokens> {
  const { code: c, codeVerifier: v } = parseRedirectParams(`?code=${code}`);
  const json = await exchangeCode(API_URL, c, redirectUri, v);
  const tokens: StoredTokens = {
    accessToken:  json.access_token,
    idToken:      json.id_token,
    refreshToken: json.refresh_token,
    expiresIn:    json.expires_in,
    fetchedAt:    Date.now(),
  };
  await tokenStorage.storeTokens(tokens);
  return tokens;
}
