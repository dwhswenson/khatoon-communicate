// src/auth/screens/HomeScreen.test.tsx
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    manifest: {
      extra: {
        COGNITO_DOMAIN:    'foo.auth.us-east-2.amazoncognito.com',
        COGNITO_CLIENT_ID: 'myClientId123',
      },
    },
  },
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn().mockReturnValue('redirect://uri'),
}));

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('../contexts/AuthContext');

jest.mock('../utils/urls', () => ({
  buildLogoutUrl: jest.fn().mockReturnValue('https://example.com/logout'),
}));

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { Platform } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { AuthFlowParamList } from '../navigators/types';

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../contexts/AuthContext';
import { buildLogoutUrl } from '../utils/urls';

const fakeUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const fakeRoute: RouteProp<AuthFlowParamList,'Home'> = {
  key:   'Home-1',
  name:  'Home',
  params: undefined,
};

import HomeScreen from './HomeScreen';

describe('<HomeScreen />', () => {
  const mockNav = { reset: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the user email when present', () => {
    fakeUseAuth.mockReturnValue({
      userEmail: 'alice@example.com',
      signOut: jest.fn(),
      getAccessToken: jest.fn(),
      isLoading: false,
      isSignedIn: true,
      signIn: jest.fn(),
    });

    render(<HomeScreen navigation={mockNav} route={fakeRoute} />);

    expect(screen.getByText('Logged in as: alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('You’re signed in! 🎉')).toBeInTheDocument();
  });

  it('does not render the email text when userEmail is null', () => {
    fakeUseAuth.mockReturnValue({
      userEmail: null,
      signOut: jest.fn(),
      getAccessToken: jest.fn(),
      isLoading: false,
      isSignedIn: true,
      signIn: jest.fn(),
    });

    render(<HomeScreen navigation={mockNav} route={fakeRoute} />);
    expect(screen.queryByText(/^Logged in as:/)).toBeNull();
    expect(screen.getByText('You’re signed in! 🎉')).toBeInTheDocument();
  });

  describe('web logout flow', () => {
    beforeAll(() => {
      // force the web branch
      (Platform as any).OS = 'web';
      // capture window.location.assign
      // @ts-ignore
      delete window.location;
      // @ts-ignore
      window.location = { assign: jest.fn() };
    });

    it('calls signOut then window.location.assign with the logout URL', async () => {
      const signOutMock = jest.fn().mockResolvedValue(undefined);
      fakeUseAuth.mockReturnValue({
        userEmail: 'u@e.com',
        signOut: signOutMock,
        getAccessToken: jest.fn(),
        isLoading: false,
        isSignedIn: true,
        signIn: jest.fn(),
      });

      render(<HomeScreen navigation={mockNav} route={fakeRoute} />);
      fireEvent.click(screen.getByText('Sign Out'));

      await waitFor(() => {
        expect(signOutMock).toHaveBeenCalled();
        expect(buildLogoutUrl).toHaveBeenCalledWith({
          domain:      'foo.auth.us-east-2.amazoncognito.com',
          clientId:    'myClientId123',
          redirectUri: 'redirect://uri',
        });
        expect(window.location.assign).toHaveBeenCalledWith('https://example.com/logout');
      });

      expect(signOutMock).toHaveBeenCalled();
      expect(buildLogoutUrl).toHaveBeenCalledWith({
        domain:       expect.any(String),
        clientId:     expect.any(String),
        redirectUri:  'redirect://uri',
      });
      expect(window.location.assign).toHaveBeenCalledWith('https://example.com/logout');
    });
  });

  describe('native logout flow', () => {
    beforeAll(() => {
      (Platform as any).OS = 'ios';
    });

    it('calls signOut then WebBrowser.openAuthSessionAsync and navigation.reset', async () => {
      const signOutMock = jest.fn().mockResolvedValue(undefined);
      fakeUseAuth.mockReturnValue({
        userEmail: 'u@e.com',
        signOut: signOutMock,
        getAccessToken: jest.fn(),
        isLoading: false,
        isSignedIn: true,
        signIn: jest.fn(),
      });

      render(<HomeScreen navigation={mockNav} route={fakeRoute} />);
      fireEvent.click(screen.getByText('Sign Out'));

      await waitFor(() => {
        expect(signOutMock).toHaveBeenCalled();
        expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
          'https://example.com/logout',
          'redirect://uri'
        );
        expect(mockNav.reset).toHaveBeenCalledWith({
          index:  0,
          routes: [{ name: 'Auth' }],
        });
      });
    });
  });
});
