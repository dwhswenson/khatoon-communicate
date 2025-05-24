// src/auth/utils/refreshTokens.test.ts

(globalThis as any).fetch = jest.fn();
jest.mock('expo-secure-store', () => {
  const memory: Record<string,string> = {};
  return {
    setItemAsync:    async (k: string, v: string) => { memory[k] = v; },
    getItemAsync:    async (k: string)     => memory[k] ?? null,
    deleteItemAsync: async (k: string)     => { delete memory[k]; },
    ALWAYS_THIS_DEVICE_ONLY: 'ALWAYS_THIS_DEVICE_ONLY',
  };
});

import { refreshTokens } from './refreshTokens';
import * as storage from './tokenStorage';

const staleTokens = {
  accessToken:  'oldA',
  idToken:      'oldI',
  refreshToken: 'oldR',
  expiresIn:    10,
  fetchedAt:    Date.now() - 20_000, // expired
};

describe('refreshTokens()', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    await storage.storeTokens(staleTokens);
  });

  afterEach(async () => {
    await storage.clearTokens();
  });

  it('returns true and replaces tokens on HTTP 200', async () => {
    const newPayload = {
      access_token:  'newA',
      id_token:      'newI',
      refresh_token: 'newR',
      expires_in:    3600,
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok:   true,
      json: async () => newPayload,
    } as any);

    const ok = await refreshTokens();
    expect(ok).toBe(true);

    const stored = await storage.getTokens();
    expect(stored).toMatchObject({
      accessToken:  'newA',
      idToken:      'newI',
      refreshToken: 'newR',
    });
  });

  it('returns false and clears storage on HTTP 400', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok:     false,
      status: 400,
      text:   async () => 'Bad request',
    } as any);

    const ok = await refreshTokens();
    expect(ok).toBe(false);

    const stored = await storage.getTokens();
    expect(stored).toBeNull();
  });
});
