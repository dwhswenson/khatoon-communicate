// src/auth/utils/pkce.ts

/**
 * PKCE (Proof Key for Code Exchange) utilities.
 *
 * Implements helper functions to generate a secure code verifier and its
 * corresponding SHA-256 code challenge, as required by the OAuth2 PKCE flow.
 */

import * as Crypto from 'expo-crypto';

/**
 * Generates a cryptographically secure random string.
 *
 * Uses the Web Crypto API to produce `length` random bytes, then
 * encodes them as a lowercase hexadecimal string (two characters per byte).
 *
 * @param length - Number of random bytes to generate.
 * @returns A hex-encoded random string of length `2 * length`.
 */
export function randomString(length: number) {
  const arr = new Uint8Array(length);
  // browser crypto only on web
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => ('0' + b.toString(16)).slice(-2)).join('');
}

/**
 * Computes a Base64URL-encoded SHA-256 hash of the given string.
 *
 * @param str - The input string to hash.
 * @returns A promise that resolves to the Base64URL-encoded SHA-256 digest.
 */
export async function sha256Base64Url(str: string) {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    str,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  // convert base64 to base64url
  return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Generates a PKCE code verifier and its associated code challenge.
 *
 * The code verifier is a random string, and the code challenge is the
 * Base64URL-encoded SHA-256 hash of that verifier.
 *
 * @returns A promise resolving to an object containing:
 * - `codeVerifier`: the random string used as the verifier.
 * - `codeChallenge`: the derived Base64URL-encoded SHA-256 challenge.
 */
export async function generatePkcePair() {
  const codeVerifier = randomString(32);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  return { codeVerifier, codeChallenge };
}


