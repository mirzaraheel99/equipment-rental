import { endSession, readStoredSession, refreshStoredSession } from './session-exchange.js';
import type { AuthSession, AuthTokenProvider } from './types.js';

export interface BrowserAuthTokenProviderOptions {
  /** The ERMS API base URL (same value apps pass to ApiClient). */
  baseUrl: string;
  /** Refresh proactively when the access token has less than this much
   * life left, so a request never races an about-to-expire token. */
  refreshSkewMs?: number;
}

function toAuthSession(stored: ReturnType<typeof readStoredSession>): AuthSession | undefined {
  if (!stored) return undefined;
  return { userId: stored.userId, tenantId: stored.tenantId, accessToken: stored.accessToken, expiresAt: stored.expiresAt };
}

/**
 * Real `AuthTokenProvider` backed by the Phase 03 auth API and
 * `localStorage`-persisted session state (§5.3). Replaces
 * `createNullAuthTokenProvider()` once a session has actually been
 * established via `establishSession`/`establishLocalDevSession`.
 */
export function createBrowserAuthTokenProvider(options: BrowserAuthTokenProviderOptions): AuthTokenProvider {
  const refreshSkewMs = options.refreshSkewMs ?? 5_000;

  return {
    async getSession() {
      const stored = readStoredSession();
      if (!stored) return undefined;

      if (new Date(stored.expiresAt).getTime() - Date.now() > refreshSkewMs) {
        return toAuthSession(stored);
      }
      return this.refreshSession();
    },

    async refreshSession() {
      const refreshed = await refreshStoredSession(options.baseUrl);
      return toAuthSession(refreshed);
    },

    async clearSession() {
      await endSession(options.baseUrl);
    },
  };
}
