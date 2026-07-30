import { AppShell, CommandPalette, GlobalHeader, useCommandPaletteShortcut } from '@erms/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const meta: Meta = { title: 'Foundation/App Shell' };
export default meta;

function ShellDemo() {
  const [workspaceId, setWorkspaceId] = useState('tenant-1');
  const [scopeIds, setScopeIds] = useState<string[]>([]);
  const [paletteOpen, setPaletteOpen] = useCommandPaletteShortcut();

  return (
    <AppShell
      header={
        <GlobalHeader
          workspace={{ id: workspaceId, name: workspaceId === 'tenant-1' ? 'Acme Rentals KSA' : 'Acme Rentals UAE' }}
          workspaces={[
            { id: 'tenant-1', name: 'Acme Rentals KSA' },
            { id: 'tenant-2', name: 'Acme Rentals UAE' },
          ]}
          onWorkspaceSelect={setWorkspaceId}
          scopeLabel="Branch"
          scopeOptions={[
            { id: 'branch-1', name: 'Riyadh Yard' },
            { id: 'branch-2', name: 'Jeddah Yard' },
          ]}
          selectedScopeIds={scopeIds}
          onScopeChange={setScopeIds}
          notifications={[{ id: 'n1', title: 'Contract #4021 expiring in 3 days', occurredAt: 'now', type: 'warning', read: false }]}
          onNotificationSelect={() => undefined}
          onMarkAllNotificationsRead={() => undefined}
          approvals={[{ id: 'a1', title: 'Credit override — SAR 45,000', requestedBy: 'Sara Al-Qahtani' }]}
          onApprovalSelect={() => undefined}
          onOpenSearch={() => setPaletteOpen(true)}
          displayName="Omar Al-Fahad"
          email="omar@acme-rentals.sa"
          language="en"
          onLanguageChange={() => undefined}
          onLogout={() => undefined}
        />
      }
    >
      <div style={{ padding: 24 }}>Page content goes here.</div>
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        items={[{ id: 'create-reservation', label: 'Create reservation', group: 'Create', icon: Plus, onSelect: () => undefined }]}
      />
    </AppShell>
  );
}

export const Default: StoryObj = { render: () => <ShellDemo /> };
