import { Bell } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';
import { EmptyState } from '../components/empty-state';

export interface NotificationSummary {
  id: string;
  title: string;
  occurredAt: string;
  /** doc 21 §24.1 */
  type: 'informational' | 'action_required' | 'approval_required' | 'warning' | 'critical';
  read: boolean;
}

export interface NotificationBellProps {
  notifications: NotificationSummary[];
  onSelect: (notificationId: string) => void;
  onMarkAllRead: () => void;
}

/** doc 21 §24.2 — critical notifications must not disappear silently; this
 * shell only renders what it's given, the caller owns retention/escalation. */
export function NotificationBell({ notifications, onSelect, onMarkAllRead }: NotificationBellProps) {
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative rounded-erms-sm p-2 text-erms-fg hover:bg-erms-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-erms-full bg-danger-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="px-0 py-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs text-brand-600 hover:underline focus-visible:outline-none"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <EmptyState title="No notifications" className="border-0 py-6" />
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} onSelect={() => onSelect(notification.id)}>
              <span className={notification.read ? 'text-erms-muted' : 'font-medium text-erms-fg'}>
                {notification.title}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
