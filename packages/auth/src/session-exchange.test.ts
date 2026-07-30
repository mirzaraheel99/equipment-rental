import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearStoredSession,
  endSession,
  establishSession,
  readStoredSession,
  refreshStoredSession,
} from './session-exchange.js';

/** Header.payload.signature with a payload of {"exp": <futureSeconds>} —
 * only the shape matters, since decodeJwtExpiryMs never verifies it. */
function fakeAccessToken(expiresInSeconds: number): string {
  const payload = { exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const base64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${base64}.signature`;
}

function mockFetchOnce(body: unknown, ok = true): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValueOnce({
      ok,
      json: () => Promise.resolve(body),
    }),
  );
}

describe('session-exchange', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('establishSession persists the session on success', async () => {
    mockFetchOnce({
      success: true,
      data: { accessToken: fakeAccessToken(900), refreshToken: 'r1', userId: 'u1', tenantId: 't1' },
    });

    const session = await establishSession('https://api.example.com', 'id-token', 't1');

    expect(session?.userId).toBe('u1');
    expect(readStoredSession()?.refreshToken).toBe('r1');
  });

  it('establishSession returns undefined and stores nothing on failure', async () => {
    mockFetchOnce({ success: false, error: { code: 'UNAUTHORIZED', message: 'nope' } }, false);

    const session = await establishSession('https://api.example.com', 'bad-token');

    expect(session).toBeUndefined();
    expect(readStoredSession()).toBeUndefined();
  });

  it('refreshStoredSession rotates the stored refresh token', async () => {
    mockFetchOnce({
      success: true,
      data: { accessToken: fakeAccessToken(900), refreshToken: 'r1', userId: 'u1', tenantId: 't1' },
    });
    await establishSession('https://api.example.com', 'id-token', 't1');

    mockFetchOnce({
      success: true,
      data: { accessToken: fakeAccessToken(900), refreshToken: 'r2', userId: 'u1', tenantId: 't1' },
    });
    const refreshed = await refreshStoredSession('https://api.example.com');

    expect(refreshed?.refreshToken).toBe('r2');
    expect(readStoredSession()?.refreshToken).toBe('r2');
  });

  it('refreshStoredSession clears storage when the refresh token is rejected', async () => {
    mockFetchOnce({
      success: true,
      data: { accessToken: fakeAccessToken(900), refreshToken: 'r1', userId: 'u1', tenantId: 't1' },
    });
    await establishSession('https://api.example.com', 'id-token', 't1');

    mockFetchOnce({ success: false, error: { code: 'UNAUTHORIZED', message: 'reused' } }, false);
    const refreshed = await refreshStoredSession('https://api.example.com');

    expect(refreshed).toBeUndefined();
    expect(readStoredSession()).toBeUndefined();
  });

  it('endSession clears storage even when the logout request fails', async () => {
    mockFetchOnce({
      success: true,
      data: { accessToken: fakeAccessToken(900), refreshToken: 'r1', userId: 'u1', tenantId: 't1' },
    });
    await establishSession('https://api.example.com', 'id-token', 't1');

    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('network down')));
    await endSession('https://api.example.com');

    expect(readStoredSession()).toBeUndefined();
  });

  it('clearStoredSession is a no-op when nothing is stored', () => {
    expect(() => clearStoredSession()).not.toThrow();
  });
});
