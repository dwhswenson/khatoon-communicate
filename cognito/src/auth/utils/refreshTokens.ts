// src/utils/refreshTokens.ts

/**
 * Module: refreshTokens
 *
 * This module provides two main functions for handling Cognito token refresh:
 * 1. `refreshTokens()`: Exchanges the stored refresh token for new tokens via the backend API,
 *    updates storage, and reschedules the next refresh.
 * 2. `scheduleProactiveRefresh()`: Calculates when to proactively refresh tokens (one minute before expiry)
 *    and sets a timer to invoke the refresh.
 *
 * Internally, a helper `doRefresh()` performs the actual fetch and rescheduling logic.
 *
 * @packageDocumentation
 */

import { getTokens, storeTokens, clearTokens, Tokens } from "./tokenStorage";
import Constants from 'expo-constants';

/**
 * Shape of the JSON response returned by the refresh API.
 * @internal
 */
interface TokenResponse {
  access_token:  string;
  id_token:      string;
  refresh_token?: string;
  expires_in:    number;
}

const { EXCHANGE_API_URL } = (Constants.manifest?.extra ?? {}) as any;
const REFRESH_URL = `${EXCHANGE_API_URL}/refresh`;

// Holds the timer ID for the next proactive refresh, if any.
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Attempts to refresh authentication tokens using the stored refresh token.
 *
 * - If no refresh token is available, immediately returns `false`.
 * - On a successful response, updates stored tokens, schedules the next refresh, and returns `true`.
 * - On failure (HTTP error or network), clears all tokens and returns `false`.
 *
 * @returns `true` if tokens were refreshed successfully; otherwise `false`.
 */
export async function refreshTokens(): Promise<boolean> {
  const tokens = await getTokens();
  if (!tokens?.refreshToken) return false;
  try {
    const res = await fetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (!res.ok) throw new Error(`Refresh failed ${res.status}`);
    const newTokens = (await res.json()) as TokenResponse;
    const merged: Tokens = {
      accessToken:  newTokens.access_token,
      idToken:      newTokens.id_token,
      refreshToken: newTokens.refresh_token ?? tokens.refreshToken,
      expiresIn:    newTokens.expires_in,
      fetchedAt:    Date.now(),
    };

    await storeTokens(merged);
    scheduleProactiveRefresh();
    return true;
  } catch {
    await clearTokens();
    return false;
  }
}

/**
 * Schedules a proactive token refresh one minute before current tokens expire.
 *
 * - Clears any existing scheduled refresh timer.
 * - Computes the delay until (expiryTime - 60s). If that delay is <= 0, invokes `doRefresh()` immediately.
 * - Otherwise, sets a timeout to call `doRefresh()` after the computed delay.
 *
 * @returns A promise that resolves once the scheduling logic completes.
 */
export async function scheduleProactiveRefresh(): Promise<void> {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  const tokens = await getTokens();
  if (!tokens) {
    return;
  }

  // calculate milliseconds until just before expiry
  const now         = Date.now();
  const expiresInMs = tokens.expiresIn * 1000;
  const elapsed     = now - tokens.fetchedAt;
  const msUntilRefresh = expiresInMs - elapsed - (60 * 1000);

  // if it’s already too late, try immediate refresh
  if (msUntilRefresh <= 0) {
    doRefresh();
  } else {
    refreshTimer = setTimeout(doRefresh, msUntilRefresh);
    console.log(`[Auth] scheduled refresh in ${msUntilRefresh/1000} seconds`);
  }
}

/**
 * Internal helper to perform the actual token refresh and reschedule or clear on failure.
 *
 * @internal
 */
async function doRefresh() {
  console.log("[Auth] proactively refreshing tokens…");
  const ok = await refreshTokens();
  if (ok) {
    console.log("[Auth] refresh successful, scheduling next");
    scheduleProactiveRefresh();
  } else {
    console.warn("[Auth] refresh failed, clearing tokens");
    clearTokens();
    // optionally navigate to Auth screen here:
    // navigation.replace("Auth");
  }
}
