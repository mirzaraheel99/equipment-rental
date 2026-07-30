'use client';

import { Alert, Button, PageContainer } from '@erms/ui';
import { useEffect } from 'react';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <Alert variant="danger" title="Something went wrong">
        An unexpected error occurred while rendering this page.
      </Alert>
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </PageContainer>
  );
}
