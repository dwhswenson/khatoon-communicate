// src/auth/navigators/AuthFlow.test.tsx

jest.mock('expo-auth-session', () => ({
  // match whatever your AuthScreen actually imports/uses
  ResponseType:      { Code: 'code' },
  useAuthRequest:    () => [null, null, () => Promise.resolve()],
  makeRedirectUri:   () => 'test://redirect',
}));
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: () => {},
}));
jest.mock('expo-crypto', () => ({
  digestStringAsync:      async () => 'FAKEHASH',
  CryptoDigestAlgorithm:  { SHA256: 'SHA256' },
  CryptoEncoding:         { BASE64:  'base64'  },
}));
//jest.mock('expo-constants', () => ({
  //default: { manifest: { extra: { /* EXCHANGE_API_URL, etc. */ } } },
//}));


import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthContent, AuthContentProps } from '../components/AuthContent';
import { useAuth } from '../contexts/AuthContext';

jest.mock('../contexts/AuthContext');
const fakeUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const dummyLinking = {
  prefixes: ['test://'],
  config:   { screens: { Splash:'', Auth:'redirect', Home:'home' } },
};


describe('AuthContent', () => {
  const scenarios = [
    { name: 'loading',    isLoading: true,  isSignedIn: false, expectTestId: 'Splash-root' },
    { name: 'signed_out', isLoading: false, isSignedIn: false, expectTestId: 'Auth-root' },
    { name: 'signed_in',  isLoading: false, isSignedIn: true,  expectTestId: 'Home-root' },
  ];

  scenarios.forEach(({ name, isLoading, isSignedIn, expectTestId }) => {
    it(`shows the correct screen when ${name}`, () => {
      render(
        <AuthContent
          isLoading={isLoading}
          isSignedIn={isSignedIn}
          SplashComponent={() => <div data-testid="Splash-root" />}
          AuthScreenComponent={() => <button data-testid="Auth-root">LOGIN</button>}
          HomeScreenComponent={() => <button data-testid="Home-root">LOGOUT</button>}
        />
      );
      expect(screen.getByTestId(expectTestId)).toBeInTheDocument();
    });
  });
});
