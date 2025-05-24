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


//
// 2) NOW import everything else
//

import React                 from 'react';
import { renderHook, act, waitFor }   from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as storage          from '../utils/tokenStorage';
import * as refreshUtils     from '../utils/refreshTokens';


//
// 3) WRITE YOUR TESTS
//

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
    // polyfill fetch on global
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
    // first stub getTokens so provider thinks it's signed in
    (storage.getTokens as jest.Mock).mockResolvedValue({
      accessToken: 'x', idToken: goodJwt, refreshToken: 'z', expiresIn: 3600, fetchedAt: Date.now()
    });
    (refreshUtils.refreshTokens as jest.Mock).mockResolvedValue(true);

    // mount and rehydrate
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isSignedIn).toBe(true);

    // now sign out
    await act(() => result.current.signOut());
    expect(result.current.isSignedIn).toBe(false);
    expect(storage.clearTokens).toHaveBeenCalled();
    expect(result.current.userEmail).toBeNull();
  });
});
