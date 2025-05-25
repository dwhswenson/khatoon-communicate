// src/auth/hooks/useWebAuth.test.ts

jest.mock('expo-crypto', () => ({
  digestStringAsync:       jest.fn(),
  CryptoDigestAlgorithm:   { SHA256: 'SHA256' },
  CryptoEncoding:          { BASE64:   'base64'  },
}));

import React from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { useWebAuth }     from './useWebAuth';
import * as pkce          from '../utils/pkce';
import * as urls          from '../utils/urls';
import * as tokenClient   from '../utils/tokenClient';
import * as tokenStorage  from '../utils/tokenStorage';

type HookReturn = ReturnType<typeof useWebAuth>;

beforeEach(() => {
  cleanup();
  jest.clearAllMocks();

  let store: Record<string, string> = {};
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem:    jest.fn((key: string) => store[key] ?? null),
      setItem:    jest.fn((key: string, val: string) => { store[key] = String(val); }),
      removeItem: jest.fn((key: string) => { delete store[key]; }),
      clear:      jest.fn(() => { store = {}; }),
    },
    writable: true,
  });

  // stub window.location.assign
  delete (window as any).location;
  (window as any).location = { assign: jest.fn() };
});


describe('useWebAuth (manual render)', () => {
  const config = {
    domain:      'dev-xyz.auth.us-east-2.amazoncognito.com',
    clientId:    'CLIENT123',
    redirectUri: 'https://app.test/redirect',
    exchangeUrl: 'https://api.test/exchange',
  };

  let hook: HookReturn;

  function Wrapper() {
    hook = useWebAuth(config);
    return null;
  }

  beforeEach(() => {
    cleanup();
    jest.clearAllMocks();

    // stub out sessionStorage & location
    jest.spyOn(sessionStorage, 'setItem');
    jest.spyOn(sessionStorage, 'getItem');
    delete (window as any).location;
    (window as any).location = { assign: jest.fn() };
  });

  it('login() → PKCE + URL + navigation + loading', async () => {
    // 1) stub PKCE
    jest.spyOn(pkce, 'generatePkcePair')
      .mockResolvedValue({ codeVerifier: 'VER', codeChallenge: 'CHAL' });
    // 2) stub URL builder
    jest.spyOn(urls, 'buildAuthorizeUrl')
      .mockReturnValue('https://login?foo=bar');

    render(React.createElement(Wrapper));

    expect(hook.loading).toBe(false);

    // call login inside act
    await act(async () => {
      await hook.login();
    });

    expect(pkce.generatePkcePair).toHaveBeenCalled();
    expect(sessionStorage.setItem).toHaveBeenCalledWith('pkce_verifier', 'VER');
    expect(urls.buildAuthorizeUrl).toHaveBeenCalledWith(config, 'CHAL');
    expect(window.location.assign).toHaveBeenCalledWith('https://login?foo=bar');
    // note: loading was set to true by login()
    expect(hook.loading).toBe(true);
  });

  it('handleRedirect() → exchange + store + loading=false + return tokens', async () => {
    const fakeTokens = {
      access_token:  'A123',
      id_token:      'I456',
      refresh_token: 'R789',
      expires_in:    3600,
    };
    jest.spyOn(tokenClient, 'exchangeCode')
      .mockResolvedValue(fakeTokens);
    jest.spyOn(tokenStorage, 'storeTokens')
      .mockResolvedValue(undefined);
    sessionStorage.setItem('pkce_verifier', 'VER');

    render(React.createElement(Wrapper));

    let result: typeof fakeTokens | undefined;
    await act(async () => {
      result = await hook.handleRedirect('?code=XYZ');
    });

    // we got back the same object
    expect(result).toBe(fakeTokens);
    // exchangeCode called correctly
    expect(tokenClient.exchangeCode).toHaveBeenCalledWith(
      config.exchangeUrl, 'XYZ', config.redirectUri, 'VER'
    );
    // storeTokens shape correct
    expect(tokenStorage.storeTokens).toHaveBeenCalledWith({
      accessToken:  fakeTokens.access_token,
      idToken:      fakeTokens.id_token,
      refreshToken: fakeTokens.refresh_token,
      expiresIn:    fakeTokens.expires_in,
      fetchedAt:    expect.any(Number),
    });
    expect(hook.loading).toBe(false);
  });
});
