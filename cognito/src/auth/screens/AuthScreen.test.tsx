// src/auth/screens/AuthScreen.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Platform } from 'react-native';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    isLoading:      false,
    isSignedIn:     false,
    userEmail:      null,
    signIn:         jest.fn(),
    signOut:        jest.fn(),
    getAccessToken: jest.fn(),
  }),
}));

jest.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: () => {} }));
jest.mock('expo-auth-session',  () => ({
  useAuthRequest:  () => [null, null, jest.fn()],
  makeRedirectUri: () => 'http://localhost:8081/redirect',
  ResponseType:    { Code: 'code' },
}));

jest.mock('../hooks/useWebAuth');
import { useWebAuth } from '../hooks/useWebAuth';

import AuthScreen from './AuthScreen';

describe('<AuthScreen /> (web only)', () => {
  const fakeNav   = { replace: jest.fn() } as any;
  const fakeRoute = { params: {} } as any;

  beforeAll(() => {
    // force the "web" branch of Platform.OS
    Platform.OS = 'web';
  });

  it('renders login button and calls login()', () => {
    const loginMock = jest.fn();
    (useWebAuth as jest.Mock).mockReturnValue({
      login:          loginMock,
      handleRedirect: jest.fn(),
      loading:        false,
    });

    render(<AuthScreen navigation={fakeNav} route={fakeRoute} />);

    // find by ARIA role—this works both native/web for a <Button>
    const btn = screen.getByRole('button', { name: 'Log in with Cognito' });
    fireEvent.click(btn);

    expect(loginMock).toHaveBeenCalled();
  });

  it('disables button and shows spinner when loading', () => {
    const loginMock = jest.fn();
    (useWebAuth as jest.Mock).mockReturnValue({
      login:          loginMock,
      handleRedirect: jest.fn(),
      loading:        true,
    });

    render(<AuthScreen navigation={fakeNav} route={fakeRoute} />);

    const btn     = screen.getByRole('button', { name: 'Log in with Cognito' });
    const spinner = screen.getByRole('progressbar');

    expect(btn).toBeDisabled();
    expect(spinner).toBeInTheDocument();
  });
});
