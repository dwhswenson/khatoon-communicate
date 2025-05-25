// src/auth/utils/redirect.test.ts
import { parseRedirectParams } from './redirect';

describe('parseRedirectParams()', () => {
  beforeAll(() => {
    // stub sessionStorage
    sessionStorage.setItem('pkce_verifier', 'VERIFIER123');
  });

  it('extracts code & verifier when both present', () => {
    const { code, codeVerifier } = parseRedirectParams('?code=ABC&foo=bar');
    expect(code).toBe('ABC');
    expect(codeVerifier).toBe('VERIFIER123');
  });

  it('throws if no code', () => {
    expect(() => parseRedirectParams('?foo=bar')).toThrow(/Missing code/);
  });

  it('throws if no verifier in sessionStorage', () => {
    sessionStorage.removeItem('pkce_verifier');
    expect(() => parseRedirectParams('?code=XYZ')).toThrow(/No PKCE verifier/);
  });
});
