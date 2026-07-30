import { endSession, establishLocalDevSession, readStoredSession } from '@erms/auth';

import { publicEnv } from './env';

/** Thin app-level bindings over @erms/auth's session helpers, fixed to
 * this app's API base URL so pages don't each import publicEnv. */
export function signInAsDevUser(devUserId: string, tenantId: string) {
  return establishLocalDevSession(publicEnv.NEXT_PUBLIC_API_BASE_URL, devUserId, tenantId);
}

export function signOut() {
  return endSession(publicEnv.NEXT_PUBLIC_API_BASE_URL);
}

export function getCurrentSession() {
  return readStoredSession();
}
