export interface OidcSessionResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  tenantId: string;
}

export interface StoredSession {
  userId: string;
  tenantId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export const SESSION_STORAGE_KEY = 'erms-auth-session';

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

async function postJson<T>(url: string, body: unknown): Promise<T | undefined> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const envelope = (await response.json().catch(() => undefined)) as ApiEnvelope<T> | undefined;
  if (!response.ok || !envelope || envelope.success === false) return undefined;
  return envelope.data;
}

/** Reads the `exp` claim out of a JWT without verifying it — safe client-
 * side, since the token's signature was already verified server-side; this
 * is only used to know when to proactively refresh. */
function decodeJwtExpiryMs(token: string): number | undefined {
  const payloadSegment = token.split('.')[1];
  if (!payloadSegment) return undefined;
  try {
    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}

function toStoredSession(response: OidcSessionResponse): StoredSession {
  const expiryMs = decodeJwtExpiryMs(response.accessToken) ?? Date.now() + 10 * 60 * 1000;
  return {
    userId: response.userId,
    tenantId: response.tenantId,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: new Date(expiryMs).toISOString(),
  };
}

export function readStoredSession(): StoredSession | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return undefined;
  }
}

export function writeStoredSession(session: StoredSession): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Exchanges a verified OIDC ID token for an ERMS session and persists it —
 * called once, from the login page, before any AuthTokenProvider exists to
 * ask for a session. docs/04-Domain/03-AUTHENTICATION-AND-ACCESS-GOVERNANCE-
 * DOMAIN-SPECIFICATION.md §5.2. Session storage is `localStorage` for this
 * lite pass — an explicit tradeoff against httpOnly cookies, tracked as an
 * open item (XSS exposes the token) rather than a silent choice.
 */
export async function establishSession(
  baseUrl: string,
  idToken: string,
  tenantId?: string,
): Promise<StoredSession | undefined> {
  const data = await postJson<OidcSessionResponse>(`${trimTrailingSlash(baseUrl)}/auth/session`, {
    idToken,
    tenantId,
  });
  if (!data) return undefined;
  const session = toStoredSession(data);
  writeStoredSession(session);
  return session;
}

/** Local-dev-only convenience: fetches a stub ID token for a seeded user
 * (§5.1), then exchanges it — collapses the two-step flow into one call for
 * the dev login page. 404s wherever the API runs with AUTH_OIDC_PROVIDER=entra-id. */
export async function establishLocalDevSession(
  baseUrl: string,
  devUserId: string,
  tenantId: string,
): Promise<StoredSession | undefined> {
  const devLoginResponse = await postJson<{ idToken: string }>(`${trimTrailingSlash(baseUrl)}/auth/dev/login`, {
    devUserId,
    tenantId,
  });
  if (!devLoginResponse) return undefined;
  return establishSession(baseUrl, devLoginResponse.idToken, tenantId);
}

/** Rotates the refresh token and mints a fresh access token, persisting the
 * result. Returns undefined (and clears storage) if the refresh token is
 * unknown, expired, or already used. */
export async function refreshStoredSession(baseUrl: string): Promise<StoredSession | undefined> {
  const stored = readStoredSession();
  if (!stored) return undefined;

  const data = await postJson<OidcSessionResponse>(`${trimTrailingSlash(baseUrl)}/auth/refresh`, {
    refreshToken: stored.refreshToken,
  });
  if (!data) {
    clearStoredSession();
    return undefined;
  }
  const session = toStoredSession(data);
  writeStoredSession(session);
  return session;
}

export async function endSession(baseUrl: string): Promise<void> {
  const stored = readStoredSession();
  clearStoredSession();
  if (!stored) return;
  await fetch(`${trimTrailingSlash(baseUrl)}/auth/logout`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: stored.refreshToken }),
  }).catch(() => undefined);
}
