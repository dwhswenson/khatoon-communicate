// src/auth/utils/pkce.ts
import * as Crypto from 'expo-crypto';

export function randomString(length: number) {
  const arr = new Uint8Array(length);
  // browser crypto only on web
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => ('0' + b.toString(16)).slice(-2)).join('');
}

export async function sha256Base64Url(str: string) {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    str,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  // convert base64 to base64url
  return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function generatePkcePair() {
  const codeVerifier = randomString(32);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  return { codeVerifier, codeChallenge };
}


