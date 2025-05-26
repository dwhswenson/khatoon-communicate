// src/utils/tokenStorage.ts

/**
 * Simple cross-platform storage for authentication tokens.
 * 
 * On web, uses localStorage under the key `auth_tokens`.
 * On native (iOS/Android), uses Expo SecureStore for encrypted storage.
 * 
 * Provides helpers to store, retrieve, and clear the user's
 * access, ID, and refresh tokens along with their expiry metadata.
 */

import * as SecureStore from 'expo-secure-store';
import Constants        from 'expo-constants';
import { Platform }     from 'react-native';

/**
 * The key under which all token data is persisted.
 */
export const TOKEN_KEY = 'auth_tokens';

/**
 * Shape of the object persisted for authentication credentials.
 */
export interface Tokens {
  /** JWT access token for API authorization */
  accessToken:  string;
  /** JWT ID token containing user identity claims */
  idToken:      string;
  /** OAuth2 refresh token for obtaining new access tokens */
  refreshToken: string;
  /** Lifetime of the access token in seconds */
  expiresIn:    number;
  /** Unix timestamp (ms) when tokens were fetched and stored */
  fetchedAt:    number;
}

/**
 * Persist a Tokens object in secure storage.
 * 
 * @param tokens - the Tokens object to store
 */
export async function storeTokens(tokens: Tokens): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens), {
      keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY,
    });
  }
}

/**
 * Retrieve stored Tokens, or return null if none exist or JSON is invalid.
 * 
 * @returns the parsed Tokens object, or null if not found/invalid
 */
export async function getTokens(): Promise<Tokens | null> {
  let raw: string | null;
  if (Platform.OS === 'web') {
    raw = localStorage.getItem(TOKEN_KEY);
  } else {
    raw = await SecureStore.getItemAsync(TOKEN_KEY);
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Remove any stored Tokens from storage.
 */
export async function clearTokens(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
