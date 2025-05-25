// src/auth/utils/tokenClient.ts

export interface TokenResponse {
  access_token:  string;
  id_token:      string;
  refresh_token: string;
  expires_in:    number;
}

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
