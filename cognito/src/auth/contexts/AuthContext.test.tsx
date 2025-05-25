// src/auth/contexts/AuthContext.test.tsx

jest.mock('expo-constants', () => ({
  default: {
    manifest: {
      extra: { EXCHANGE_API_URL: 'https://test-exchange.local' },
    },
  },
}));

jest.mock('../utils/tokenStorage');
jest.mock('../utils/refreshTokens');

const goodJwt =
  'eyJhbGciOiJub25lIn0.' +
  'eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.';

import React                 from 'react';
import { renderHook, act, waitFor }   from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as storage          from '../utils/tokenStorage';
import { refreshTokens } from '../utils/refreshTokens';
import * as refreshUtils     from '../utils/refreshTokens';

describe('AuthContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();  // clear any calls or mocks
  });

  it('starts signed-out when no tokens', async () => {
    (storage.getTokens as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.userEmail).toBeNull();
  });

  it('rehydrates & signs-in on valid tokens + successful refresh', async () => {
    const fakeStored = {
      accessToken: 'a',
      idToken: goodJwt,
      refreshToken: 'r',
      expiresIn:   3600,
      fetchedAt:   Date.now(),
    };
    (storage.getTokens as jest.Mock).mockResolvedValue(fakeStored);
    (refreshUtils.refreshTokens as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.userEmail).not.toBeNull();
  });

  it('signIn() flips state on successful exchange', async () => {
    const payload = {
      access_token:  'A',
      id_token: goodJwt,
      refresh_token: 'R',
      expires_in:    3600,
    };
    (globalThis as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(() => result.current.signIn('code','verifier','https://redirect'));
    expect(result.current.isSignedIn).toBe(true);
    expect(storage.storeTokens).toHaveBeenCalled();
    expect(result.current.userEmail).not.toBeNull();
  });

  it('signOut() clears everything', async () => {
    (storage.getTokens as jest.Mock).mockResolvedValue({
      accessToken: 'x', idToken: goodJwt, refreshToken: 'z', expiresIn: 3600, fetchedAt: Date.now()
    });
    (refreshUtils.refreshTokens as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isSignedIn).toBe(true);

    await act(() => result.current.signOut());
    expect(result.current.isSignedIn).toBe(false);
    expect(storage.clearTokens).toHaveBeenCalled();
    expect(result.current.userEmail).toBeNull();
  });

  it('getAccessToken returns current access token if not expired', async () => {
    const now = Date.now();
    (storage.getTokens as jest.Mock).mockResolvedValue({
      accessToken:  'tokenA',
      idToken:      goodJwt,
      refreshToken: 'refreshA',
      expiresIn:    3600,
      fetchedAt:    now,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      const t = await result.current.getAccessToken();
      expect(t).toBe('tokenA');
    });
  });

  it('getAccessToken refreshes when token is expired', async () => {
    const oldTime = Date.now() - 10_000 * 1000;
    (storage.getTokens as jest.Mock).mockResolvedValueOnce({
      accessToken:  'oldToken',
      idToken:      goodJwt,
      refreshToken: 'refreshA',
      expiresIn:    1,
      fetchedAt:    oldTime,
    });
    (refreshUtils.refreshTokens as jest.Mock).mockResolvedValueOnce(true);
    (storage.getTokens as jest.Mock).mockResolvedValueOnce({
      accessToken:  'newToken',
      idToken:      goodJwt,
      refreshToken: 'refreshB',
      expiresIn:    3600,
      fetchedAt:    Date.now(),
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      const t = await result.current.getAccessToken();
      expect(refreshUtils.refreshTokens).toHaveBeenCalled();
      expect(t).toBe('newToken');
    });
  });

  it('getAccessToken throws if refresh fails', async () => {
    const oldTime = Date.now() - 10_000 * 1000;
    (storage.getTokens as jest.Mock).mockResolvedValue({
      accessToken:  'oldToken',
      idToken:      goodJwt,
      refreshToken: 'refreshA',
      expiresIn:    1,
      fetchedAt:    oldTime,
    });
    (refreshUtils.refreshTokens as jest.Mock).mockResolvedValueOnce(false);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.getAccessToken())
      .rejects
      .toThrow('Session expired');
  });
});

describe('getAccessToken()', () => {
  const GOOD_JWT = 'eyJhbGciOiJub25lIn0.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns current token if still valid', async () => {
    const now = Date.now();
    (storage.getTokens as jest.Mock).mockResolvedValue({
      accessToken:  'A1',
      idToken:      GOOD_JWT,
      refreshToken: 'R1',
      expiresIn:    3600,      // 1h
      fetchedAt:    now - 1000 // fresh
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => !result.current.isLoading);
    // clear the call so later expect is true
    (refreshTokens as jest.Mock).mockClear();

    await expect(result.current.getAccessToken()).resolves.toBe('A1');
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('refreshes if expired and returns new token', async () => {
    const now = Date.now();
    // first call: expired
    (storage.getTokens as jest.Mock)
      .mockResolvedValueOnce({
        accessToken:  'oldA',
        idToken:      GOOD_JWT,
        refreshToken: 'oldR',
        expiresIn:    1,
        fetchedAt:    now - 5000,
      })
      // second call: after refresh, return fresh tokens
      .mockResolvedValueOnce({
        accessToken:  'newA',
        idToken:      GOOD_JWT,
        refreshToken: 'newR',
        expiresIn:    3600,
        fetchedAt:    now,
      });
    (refreshTokens as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => !result.current.isLoading);

    await expect(result.current.getAccessToken()).resolves.toBe('newA');
    expect(refreshTokens).toHaveBeenCalled();
  });

  it('throws and clears tokens if refresh fails', async () => {
    const now = Date.now();
    (storage.getTokens as jest.Mock).mockResolvedValue({
      accessToken:  'oldA',
      idToken:      GOOD_JWT,
      refreshToken: 'oldR',
      expiresIn:    1,
      fetchedAt:    now - 5000,
    });
    (refreshTokens as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => !result.current.isLoading);

    await expect(result.current.getAccessToken()).rejects.toThrow('Session expired');
    expect(storage.clearTokens).toHaveBeenCalled();
  });

  it('throws immediately if no tokens stored', async () => {
    (storage.getTokens as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => !result.current.isLoading);

    await expect(result.current.getAccessToken()).rejects.toThrow('Not authenticated');
  });
});
