/**
 * Authentication is out of scope for Bootstrap (Phase 03 owns identity,
 * OIDC, MFA, RBAC). This package only defines the *interface* that
 * @erms/api-client and each app's request pipeline code against, so real
 * authentication can be wired in later without changing every call site.
 */

export interface AuthSession {
  userId: string;
  tenantId: string;
  accessToken: string;
  expiresAt: string;
}

export interface AuthTokenProvider {
  getSession(): Promise<AuthSession | undefined>;
  refreshSession(): Promise<AuthSession | undefined>;
  clearSession(): Promise<void>;
}

/** No-op provider used until Phase 03 wires real session handling. Always
 * returns no session — callers must treat that as "unauthenticated", never
 * as a bypass. */
export function createNullAuthTokenProvider(): AuthTokenProvider {
  return {
    getSession() {
      return Promise.resolve(undefined);
    },
    refreshSession() {
      return Promise.resolve(undefined);
    },
    clearSession() {
      return Promise.resolve();
    },
  };
}
