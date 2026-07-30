'use client';

import { Alert, Badge, PageContainer, Spinner } from '@erms/ui';
import { useEffect, useState } from 'react';

import { apiClient } from '@/lib/api-client';

interface HealthPayload {
  status: string;
  uptimeSeconds: number;
}

export default function HealthPage() {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; payload: HealthPayload }
    | { status: 'error'; message: string }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .request<HealthPayload>({ path: 'health' })
      .then((payload) => {
        if (!cancelled) setState({ status: 'ok', payload });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Health</h1>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-erms-muted">Web app:</span>
          <Badge variant="success">OK</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-erms-muted">API:</span>
          {state.status === 'loading' ? <Spinner label="Checking API health" /> : null}
          {state.status === 'ok' ? <Badge variant="success">{state.payload.status}</Badge> : null}
          {state.status === 'error' ? <Badge variant="danger">Unreachable</Badge> : null}
        </div>
        {state.status === 'error' ? (
          <Alert variant="warning" title="Could not reach the API">
            {state.message}. If you are running this locally, start the API with{' '}
            <code>pnpm --filter @erms/api dev</code>.
          </Alert>
        ) : null}
      </div>
    </PageContainer>
  );
}
