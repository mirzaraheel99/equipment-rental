export interface DevUser {
  id: string;
  email: string;
  displayName: string;
  /** Authentication Methods References this seeded user is assumed to have
   * asserted — 'mfa' lets `identity.user.manage`-style privileged flows be
   * exercised locally without a real MFA factor (see domain doc §5.2). */
  amr: string[];
}

/**
 * Fixed, non-secret seed list for `LocalDevProvider` — dev/CI only, never
 * read when `AUTH_OIDC_PROVIDER=entra-id` (docs/04-Domain/03-AUTHENTICATION-
 * AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md §5.1). Not a substitute for
 * a real user-provisioning workflow — just enough to exercise the session-
 * exchange path without a real Entra ID tenant.
 */
export const DEV_USERS: readonly DevUser[] = [
  { id: 'dev-admin', email: 'admin@dev.erms.local', displayName: 'Dev Admin', amr: ['pwd', 'mfa'] },
  { id: 'dev-operations', email: 'operations@dev.erms.local', displayName: 'Dev Operations', amr: ['pwd'] },
];

export function findDevUser(id: string): DevUser | undefined {
  return DEV_USERS.find((user) => user.id === id);
}
