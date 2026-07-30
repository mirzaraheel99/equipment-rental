import { ClipboardCheck } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';
import { EmptyState } from '../components/empty-state';

export interface ApprovalSummary {
  id: string;
  title: string;
  requestedBy: string;
}

export interface ApprovalBellProps {
  approvals: ApprovalSummary[];
  onSelect: (approvalId: string) => void;
}

/** Pending-approval indicator in the global header (doc 21 §4.1). Backed by
 * the generic Approval engine (Phase 03) once a real domain requests
 * approvals through it — this shell renders whatever list it's given. */
export function ApprovalBell({ approvals, onSelect }: ApprovalBellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative rounded-erms-sm p-2 text-erms-fg hover:bg-erms-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={`Approvals${approvals.length > 0 ? ` (${approvals.length} pending)` : ''}`}
      >
        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
        {approvals.length > 0 ? (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-erms-full bg-warning-500 px-1 text-[10px] font-medium text-white">
            {approvals.length > 9 ? '9+' : approvals.length}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Approvals</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {approvals.length === 0 ? (
          <EmptyState title="Nothing awaiting your approval" className="border-0 py-6" />
        ) : (
          approvals.map((approval) => (
            <DropdownMenuItem key={approval.id} onSelect={() => onSelect(approval.id)}>
              <div className="flex flex-col">
                <span className="font-medium text-erms-fg">{approval.title}</span>
                <span className="text-xs text-erms-muted">Requested by {approval.requestedBy}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
