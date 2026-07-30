'use client';

import { Button, ErrorState, FormField, Input, PageContainer, Skeleton } from '@erms/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import { signInAsDevUser } from '@/lib/auth-client';

interface DevUser {
  id: string;
  email: string;
  displayName: string;
}

/**
 * Local-dev-only sign-in — picks a seeded user and a tenant ID to
 * establish a session against `LocalDevProvider` (docs/04-Domain/03-
 * AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md §5.1).
 * A real Entra ID redirect login screen is a Phase 04 follow-up once a
 * real tenant exists to federate against (Open Questions Register B21).
 * The tenant ID must already exist in the database — no tenant picker UI
 * exists yet (B22).
 */
export default function LoginPage() {
  const router = useRouter();
  const [devUsers, setDevUsers] = useState<DevUser[] | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [tenantId, setTenantId] = useState('');
  const [signingInAs, setSigningInAs] = useState<string | undefined>(undefined);
  const [signInError, setSignInError] = useState<string | undefined>(undefined);

  useEffect(() => {
    apiClient
      .request<DevUser[]>({ path: 'auth/dev/users' })
      .then(setDevUsers)
      .catch(() =>
        setLoadError(
          'Could not reach the local dev identity provider. Is the API running with AUTH_OIDC_PROVIDER=local-dev?',
        ),
      );
  }, []);

  async function handleSignIn(devUserId: string) {
    setSignInError(undefined);
    setSigningInAs(devUserId);
    try {
      const session = await signInAsDevUser(devUserId, tenantId);
      if (!session) {
        setSignInError('Sign-in failed. Check the tenant ID and try again.');
        return;
      }
      router.push('/');
    } finally {
      setSigningInAs(undefined);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto flex max-w-md flex-col gap-6 py-12">
        <div>
          <h1 className="text-xl font-semibold text-erms-fg">Sign in to ERMS (local dev)</h1>
          <p className="mt-1 text-sm text-erms-muted">Pick a seeded user and the tenant to sign into.</p>
        </div>

        <FormField htmlFor="tenant-id" label="Tenant ID" required hint="A tenant row must already exist in the database.">
          <Input
            id="tenant-id"
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            placeholder="00000000-0000-7000-8000-000000000000"
          />
        </FormField>

        {loadError ? <ErrorState message={loadError} /> : null}
        {signInError ? <p className="text-sm text-danger-500">{signInError}</p> : null}

        <div className="flex flex-col gap-2">
          {devUsers === undefined && !loadError ? (
            <>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            devUsers?.map((devUser) => (
              <Button
                key={devUser.id}
                variant="secondary"
                disabled={!tenantId || signingInAs !== undefined}
                loading={signingInAs === devUser.id}
                onClick={() => void handleSignIn(devUser.id)}
              >
                Sign in as {devUser.displayName} ({devUser.email})
              </Button>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
