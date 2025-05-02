// src/auth/utils/refreshTokens.test.ts
//
(global as any).fetch = jest.fn();
// 1) Always mock the native storage pieces so no real react-native or expo gets loaded:
jest.mock('expo-secure-store', () => {
  const memory: Record<string,string> = {};
  return {
    setItemAsync:    async (k: string, v: string) => { memory[k] = v; },
    getItemAsync:    async (k: string)     => memory[k] ?? null,
    deleteItemAsync: async (k: string)     => { delete memory[k]; },
    ALWAYS_THIS_DEVICE_ONLY: 'ALWAYS_THIS_DEVICE_ONLY',
  };
});

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' }  // simulate the “native” branch
}));

// 2) Now import the module under test
import { refreshTokens } from './refreshTokens';
import * as storage from './tokenStorage';

// 3) Helper to seed stale tokens
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
    // put the stale tokens into storage
    await storage.storeTokens(staleTokens);
  });

  afterEach(async () => {
    // clear everything
    await storage.clearTokens();
  });

  it('returns true and replaces tokens on HTTP 200', async () => {
    const newPayload = {
      access_token:  'newA',
      id_token:      'newI',
      refresh_token: 'newR',
      expires_in:    3600,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok:   true,
      json: async () => newPayload,
    } as any);

    const ok = await refreshTokens();
    expect(ok).toBe(true);

    // verify storage was updated
    const stored = await storage.getTokens();
    expect(stored).toMatchObject({
      accessToken:  'newA',
      idToken:      'newI',
      refreshToken: 'newR',
    });
  });

  it('returns false and clears storage on HTTP 400', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
