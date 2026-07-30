import { Badge, PageContainer } from '@erms/ui';
import Link from 'next/link';

export default function HomePage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">ERMS — Project Bootstrap</h1>
          <Badge variant="success">Setup OK</Badge>
        </div>
        <p className="max-w-2xl text-erms-muted">
          This page only confirms the monorepo, shared UI package, theming, and localization
          foundations are wired correctly. No business screens exist yet — see{' '}
          <code className="rounded bg-erms-border/40 px-1.5 py-0.5">
            docs/00-Foundation/MASTER-INDEX.md
          </code>{' '}
          for build status.
        </p>
        <nav className="flex gap-4 text-sm">
          <Link className="text-brand-600 underline-offset-4 hover:underline" href="/health">
            Health
          </Link>
          <Link
            className="text-brand-600 underline-offset-4 hover:underline"
            href="/dev/components"
          >
            Component Gallery
          </Link>
        </nav>
      </div>
    </PageContainer>
  );
}
