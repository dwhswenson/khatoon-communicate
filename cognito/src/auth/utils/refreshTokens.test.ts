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

jest.mock('./tokenStorage');

import { refreshTokens } from './refreshTokens';
import { scheduleProactiveRefresh } from './refreshTokens';
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
    jest.clearAllTimers();
    jest.resetAllMocks();
    await storage.storeTokens(staleTokens);
    (storage.getTokens as jest.Mock).mockResolvedValue(staleTokens);
  });

  afterEach(async () => {
    jest.clearAllMocks();
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

    expect(storage.storeTokens).toHaveBeenCalledWith({
      accessToken:  'newA',
      idToken:      'newI',
      refreshToken: 'newR',
      expiresIn:    3600,
      fetchedAt:    expect.any(Number),
    });
  });

  it('returns false immediately if there are no stored tokens', async () => {
    (storage.getTokens as jest.Mock).mockResolvedValueOnce(null);

    const ok = await refreshTokens();
    expect(ok).toBe(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });


  it('returns false and clears storage on HTTP 400', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok:     false,
      status: 400,
      text:   async () => 'Bad request',
    } as any);

    const ok = await refreshTokens();
    expect(ok).toBe(false);

    expect(storage.clearTokens).toHaveBeenCalled();
  });

  it('returns false and clears storage on network error', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    const ok = await refreshTokens();
    expect(ok).toBe(false);
    expect(storage.clearTokens).toHaveBeenCalled();
  });
});

describe('scheduleProactiveRefresh()', () => {
  const FAKE_NOW = 1_000_000;
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(FAKE_NOW);
    jest.clearAllMocks();
    jest.clearAllTimers();
    (storage.getTokens as jest.Mock).mockResolvedValue({
      accessToken:  'x',
      idToken:      'i',
      refreshToken: 'r',
      expiresIn:    3600,
      fetchedAt:    FAKE_NOW,
    });
  });

  afterEach(() => {
    (Date.now as jest.Mock).mockRestore();
  });

  it('schedules a refresh one minute before expiry', async () => {
    const timeoutSpy = jest.spyOn(globalThis, 'setTimeout');
    await scheduleProactiveRefresh();
    expect(timeoutSpy).toHaveBeenCalledWith(
      expect.any(Function),
      (3600 - 60) * 1000
    );
  });

  it('clears the previous timer when called again', async () => {
    const clearSpy = jest.spyOn(globalThis, 'clearTimeout');
    await scheduleProactiveRefresh();
    await scheduleProactiveRefresh();
    expect(clearSpy).toHaveBeenCalled();
  });

});
