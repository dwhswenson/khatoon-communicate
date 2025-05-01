// src/utils/apiClient.ts

import { getTokens, clearTokens, storeTokens } from './tokenStorage';
import { refreshTokens } from './refreshTokens';  // the helper you wrote
import Constants from 'expo-constants';

const { EXCHANGE_API_URL } = (Constants.manifest?.extra ?? {}) as any;
const REFRESH_URL = `${EXCHANGE_API_URL}/refresh`; 

/**
 * A wrapper around fetch that will automatically:
 *  1) add your Bearer token
 *  2) on 401, attempt a token refresh
 *  3) retry the request once
 *  4) if that still 401s (or refresh fails), clear tokens and throw
 */
export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  // 1) grab the current tokens
  let tokens = await getTokens();
  if (!tokens) {
    throw new Error('Not authenticated');
  }

  // 2) perform the request with the access token
  let response = await fetch(input, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  // 3) if we get a 401, try refreshing once
  if (response.status === 401) {
    // attempt to refresh—this will clear tokens if it fails
    const didRefresh = await refreshTokens();
    if (!didRefresh) {
      // hopeless: force sign-out
      clearTokens();
      throw new Error('Session expired');
    }

    // we have new tokens—grab them
    tokens = await getTokens()!;
    // retry the original request
    response = await fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  // 4) If it’s still a 401, give up
  if (response.status === 401) {
    clearTokens();
    throw new Error('Session expired');
  }

  return response;
}
