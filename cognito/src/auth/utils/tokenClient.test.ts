// src/auth/utils/tokenClient.test.ts
import { exchangeCode, TokenResponse } from './tokenClient';

describe('exchangeCode()', () => {
  const fakeUrl = 'https://api.test/exchange';
  const fakePayload = { foo: 'bar' } as any;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('POSTs the right JSON and returns the parsed JSON', async () => {
    const mockRes = {
      ok:   true,
      json: async () => fakePayload,
    } as any;
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(mockRes);

    const result = await exchangeCode(
      fakeUrl,
      'CODE123',
      'https://app.test/redirect',
      'VERIFIER456'
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(fakeUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        code:         'CODE123',
        redirectUri:  'https://app.test/redirect',
        codeVerifier: 'VERIFIER456',
      }),
    });
    expect(result).toBe(fakePayload);
  });

  it('throws when res.ok is false', async () => {
    const mockRes = {
      ok:   false,
      status: 400,
      text:  async () => 'Bad!',
    } as any;
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(mockRes);

    await expect(
      exchangeCode(fakeUrl, 'C', 'R', 'V')
    ).rejects.toThrow('Token exchange failed 400: Bad!');
  });
});
