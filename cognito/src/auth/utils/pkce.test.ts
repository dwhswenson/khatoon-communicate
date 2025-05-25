// src/auth/utils/pkce.test.ts
//
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
  CryptoEncoding:      { BASE64:  'base64'  },
}));


import { randomString, sha256Base64Url, generatePkcePair } from './pkce';
import * as Crypto from 'expo-crypto';

describe('PKCE utils', () => {
  describe('randomString()', () => {
    beforeAll(() => {
      // deterministic "random" bytes 0,1,2,3,...
      Object.defineProperty(globalThis, 'crypto', {
        value: {
          getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
              arr[i] = i & 0xff;
            }
            return arr;
          },
        },
      });
    });

    it('returns a hex string of length*2 characters', () => {
      const out = randomString(4);
      expect(out).toBe('00010203');          // 4 bytes → 8 hex chars
      expect(out).toMatch(/^[0-9a-f]+$/);    // only hex digits
    });
  });

  describe('sha256Base64Url()', () => {
    it('converts a base64 hash to base64url', async () => {
      // mock the digest to produce known base64
      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce('Ab+/C==');
      const v = await sha256Base64Url('irrelevant');
      expect(v).toBe('Ab-_C');               // + → -, / → _, strip =
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
        Crypto.CryptoDigestAlgorithm.SHA256,
        'irrelevant',
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
    });
  });

  describe('generatePkcePair()', () => {
    beforeAll(() => {
      // reuse the same crypto stub from above
      jest.spyOn(Crypto, 'digestStringAsync').mockResolvedValueOnce('XYZ==');
    });

    it('combines randomString + sha256Base64Url into a pair', async () => {
      const { codeVerifier, codeChallenge } = await generatePkcePair();
      // codeVerifier should be 32 bytes → 64 hex chars
      expect(codeVerifier).toHaveLength(64);
      expect(codeVerifier).toMatch(/^[0-9a-f]{64}$/);

      // codeChallenge is whatever our mock returned, in url-safe form
      expect(codeChallenge).toBe('XYZ');
    });
  });
});
