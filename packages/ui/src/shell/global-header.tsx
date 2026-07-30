import type { Language } from '@erms/types';
import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

import { ApprovalBell, type ApprovalSummary } from './approval-bell';
import { NotificationBell, type NotificationSummary } from './notification-bell';
import { ScopeSelector, type ScopeOption } from './scope-selector';
import { UserMenu } from './user-menu';
import { WorkspaceSwitcher, type Workspace } from './workspace-switcher';

export interface GlobalHeaderProps {
  productName?: ReactNode;
  workspace: Workspace;
  workspaces: Workspace[];
  onWorkspaceSelect: (workspaceId: string) => void;
  scopeLabel: string;
  scopeOptions: ScopeOption[];
  selectedScopeIds: string[];
  onScopeChange: (selectedIds: string[]) => void;
  notifications: NotificationSummary[];
  onNotificationSelect: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  approvals: ApprovalSummary[];
  onApprovalSelect: (id: string) => void;
  onOpenSearch: () => void;
  displayName: string;
  email: string;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onLogout: () => void;
}

/** doc 21 §4.1 — compact top header carrying every global control. No
 * permanent sidebar: secondary/contextual navigation is each module's own
 * concern (doc 21 §4.2). */
export function GlobalHeader({
  productName = 'ERMS',
  workspace,
  workspaces,
  onWorkspaceSelect,
  scopeLabel,
  scopeOptions,
  selectedScopeIds,
  onScopeChange,
  notifications,
  onNotificationSelect,
  onMarkAllNotificationsRead,
  approvals,
  onApprovalSelect,
  onOpenSearch,
  displayName,
  email,
  language,
  onLanguageChange,
  onLogout,
}: GlobalHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-erms-border px-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-erms-fg">{productName}</span>
        <WorkspaceSwitcher current={workspace} workspaces={workspaces} onSelect={onWorkspaceSelect} />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full max-w-md items-center gap-2 rounded-erms-md border border-erms-border px-3 py-1.5 text-start text-sm text-erms-muted hover:bg-erms-border/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="flex-1">Search or run a command…</span>
          <kbd className="rounded-erms-sm border border-erms-border px-1.5 py-0.5 text-xs">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <ScopeSelector label={scopeLabel} options={scopeOptions} selectedIds={selectedScopeIds} onChange={onScopeChange} />
        <NotificationBell
          notifications={notifications}
          onSelect={onNotificationSelect}
          onMarkAllRead={onMarkAllNotificationsRead}
        />
        <ApprovalBell approvals={approvals} onSelect={onApprovalSelect} />
        <UserMenu
          displayName={displayName}
          email={email}
          language={language}
          onLanguageChange={onLanguageChange}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
