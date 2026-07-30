import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../lib/cn';

export interface EmptyStateProps {
  /** Explains *why* there's no data — filters, permissions, or genuinely
   * empty (doc 21 §27), not just "no data". */
  title: string;
  description?: string | undefined;
  icon?: LucideIcon | undefined;
  action?: ReactNode;
  className?: string | undefined;
}

export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-erms-md border border-dashed border-erms-border px-6 py-12 text-center',
        className,
      )}
    >
      <Icon className="h-8 w-8 text-erms-muted" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-erms-fg">{title}</p>
        {description ? <p className="text-sm text-erms-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
