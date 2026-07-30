'use client';

import {
  AppShell,
  CommandPalette,
  EmptyState,
  GlobalHeader,
  KpiCard,
  PageContainer,
  useCommandPaletteShortcut,
} from '@erms/ui';
import { Building2, ClipboardList, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { signOut } from '@/lib/auth-client';
import { useRequireSession } from '@/lib/use-require-session';

export default function DashboardPage() {
  const router = useRouter();
  const session = useRequireSession();
  const [paletteOpen, setPaletteOpen] = useCommandPaletteShortcut();

  if (!session) {
    return null; // useRequireSession is already redirecting to /login.
  }

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  return (
    <AppShell
      header={
        <GlobalHeader
          workspace={{ id: session.tenantId, name: session.tenantId }}
          workspaces={[{ id: session.tenantId, name: session.tenantId }]}
          onWorkspaceSelect={() => undefined}
          scopeLabel="Branch"
          scopeOptions={[]}
          selectedScopeIds={[]}
          onScopeChange={() => undefined}
          notifications={[]}
          onNotificationSelect={() => undefined}
          onMarkAllNotificationsRead={() => undefined}
          approvals={[]}
          onApprovalSelect={() => undefined}
          onOpenSearch={() => setPaletteOpen(true)}
          displayName={session.userId}
          email=""
          language="en"
          onLanguageChange={() => undefined}
          onLogout={() => void handleLogout()}
        />
      }
    >
      <PageContainer>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-erms-fg">Overview</h1>
            <p className="text-sm text-erms-muted">
              This is the Phase 04 application shell — Asset Registry, Contracts, and Rental Operations dashboards
              land in later phases (docs/00-Foundation/MASTER-INDEX.md).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard title="Legal entities" value="—" icon={Building2} subtitle="Wire to /legal-entities" />
            <KpiCard title="Branches" value="—" icon={Truck} subtitle="Wire to /branches" />
            <KpiCard title="Pending approvals" value="—" icon={ClipboardList} subtitle="Wire to /approvals" />
          </div>

          <EmptyState
            title="No operational modules yet"
            description="Asset Registry (Phase 05) is next on the roadmap."
          />
        </div>
      </PageContainer>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        items={[
          {
            id: 'logout',
            label: 'Sign out',
            group: 'Account',
            onSelect: () => {
              void handleLogout();
            },
          },
        ]}
      />
    </AppShell>
  );
}
