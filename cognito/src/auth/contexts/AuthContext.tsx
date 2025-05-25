// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
//import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

import { jwtDecode } from 'jwt-decode';

import {
  getTokens,
  storeTokens,
  clearTokens,
  Tokens as StoredTokens
} from '../utils/tokenStorage';
import { refreshTokens, scheduleProactiveRefresh } from '../utils/refreshTokens';

const { EXCHANGE_API_URL } = (Constants.manifest?.extra ?? {}) as Record<string, string>;

export interface AuthContextData {
  isLoading: boolean;
  isSignedIn: boolean;
  signIn(code: string, codeVerifier: string, redirectUri: string): Promise<void>;
  userEmail: string | null;
  signOut(): Promise<void>;
  getAccessToken(): Promise<string>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  //const navigation = useNavigation<any>();
  const [isLoading, setLoading] = useState(true);
  const [isSignedIn, setSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Rehydrate and refresh on mount
  useEffect(() => {
    (async () => {
      try {
        const tokens = await getTokens();
        console.log('Rehydrated tokens:', tokens);
        if (tokens) {
          try {
            const claims = jwtDecode<{ email: string }>(tokens.idToken);
            setUserEmail(claims.email);
          } catch (err: any) {
            console.error('JWT decode error:', err);
            setUserEmail(null);
          }
          const ok = await refreshTokens();
          if (ok) {
            await scheduleProactiveRefresh();
            setSignedIn(true);
          } else {
            await clearTokens();
            setUserEmail(null);
            setSignedIn(false);
          }
        }
      } catch (err) {
        console.error('Auth rehydrate error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Exchange code for tokens, persist, schedule refresh
  const signIn = async (code: string, codeVerifier: string, redirectUri: string) => {
    setLoading(true);
    try {
      // Exchange code for tokens
      const body = JSON.stringify({ code, redirectUri, codeVerifier });
      console.log('Exchange body:', body);
      const res = await fetch(`${EXCHANGE_API_URL}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri, codeVerifier })
      });
      if (!res.ok) throw new Error(`Exchange failed: ${res.status}`);
      const data = await res.json();
      const tokens: StoredTokens = {
        accessToken:  data.access_token,
        idToken:      data.id_token,
        refreshToken: data.refresh_token,
        expiresIn:    data.expires_in,
        fetchedAt:    Date.now(),
      };
      try {
        console.log('Decoding token:', data.id_token);
        console.log('Decoded ID token:', jwtDecode(data.id_token));
        const claims = jwtDecode<{ email: string }>(data.id_token);
        setUserEmail(claims.email);
      } catch (err: any) { 
        console.error('JWT decode error:', err);
        setUserEmail(null);
      }
      console.log('Storing tokens:', tokens);
      await storeTokens(tokens);
      await scheduleProactiveRefresh();
      setSignedIn(true);
    } catch (err: any) {
      console.error('signIn error:', err);
      Alert.alert('Login Error', err.message || 'Unable to sign in');
      setSignedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await clearTokens();
    setUserEmail(null);
    await scheduleProactiveRefresh();
    setSignedIn(false);
    setLoading(false);
    // TODO: Optionally navigate to Auth or trigger Hosted-UI logout
    //navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  const getAccessToken = async (): Promise<string> => {
    const tokens = await getTokens();
    if (!tokens) throw new Error('Not authenticated');

    const now = Date.now();
    const expiresAt = tokens.fetchedAt + tokens.expiresIn * 1000;
    if (now >= expiresAt) {
      // expired, try to refresh
      const ok = await refreshTokens();
      if (!ok) {
        await clearTokens();
        throw new Error('Session expired');
      }
      const newTokens = await getTokens();
      if (!newTokens) throw new Error('Session expired');
      return newTokens.accessToken;
    }

    return tokens.accessToken;
  };

  return (
    <AuthContext.Provider
      value={{ 
        isLoading,
        userEmail,
        isSignedIn,
        signIn,
        signOut,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

