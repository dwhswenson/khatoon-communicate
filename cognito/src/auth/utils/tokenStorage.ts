// src/utils/tokenStorage.ts

import * as SecureStore from 'expo-secure-store';
import Constants        from 'expo-constants';
import { Platform }     from 'react-native';

export const TOKEN_KEY = 'auth_tokens';

export interface Tokens {
  accessToken:  string;
  idToken:      string;
  refreshToken: string;
  expiresIn:    number;    // seconds until expiry
  fetchedAt:    number;    // Date.now() when stored
}

export async function storeTokens(tokens: Tokens): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens), {
      keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY,
    });
  }
}

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

export async function clearTokens(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
