// src/utils/refreshTokens.ts
import { getTokens, storeTokens, clearTokens, Tokens } from "./tokenStorage";
import Constants from 'expo-constants';

interface TokenResponse {
  access_token:  string;
  id_token:      string;
  refresh_token?: string;
  expires_in:    number;
}

const { EXCHANGE_API_URL } = (Constants.manifest?.extra ?? {}) as any;
const REFRESH_URL = `${EXCHANGE_API_URL}/refresh`;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

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

export function scheduleProactiveRefresh() {
  // clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  getTokens().then(tokens => {
    if (!tokens) return;

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
  });
}

/** Internal: do the refresh + reschedule or sign-out on failure */
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
