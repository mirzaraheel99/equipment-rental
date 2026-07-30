import { PageContainer } from '@erms/ui';
import Link from 'next/link';

export default function NotFound() {
  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-erms-muted">
        Go back to{' '}
        <Link className="text-brand-600 underline-offset-4 hover:underline" href="/">
          home
        </Link>
        .
      </p>
    </PageContainer>
  );
}
