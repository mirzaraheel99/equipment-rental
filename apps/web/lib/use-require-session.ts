'use client';

import type { AuthSession } from '@erms/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getCurrentSession } from './auth-client';

/** Client-side auth guard — redirects to /login when no session exists.
 * A `localStorage`-backed session can't be checked in server components or
 * middleware, so every protected page must use this hook (a documented
 * tradeoff of the localStorage session-storage choice — see the Phase 04
 * Decision Register entry). */
export function useRequireSession(): AuthSession | undefined {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | undefined>(undefined);

  useEffect(() => {
    const stored = getCurrentSession();
    if (!stored) {
      router.replace('/login');
      return;
    }
    setSession({
      userId: stored.userId,
      tenantId: stored.tenantId,
      accessToken: stored.accessToken,
      expiresAt: stored.expiresAt,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount; router is stable
  }, []);

  return session;
}
