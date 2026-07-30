import { Check, ChevronsUpDown, Building2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';

export interface Workspace {
  id: string;
  name: string;
}

export interface WorkspaceSwitcherProps {
  current: Workspace;
  workspaces: Workspace[];
  onSelect: (workspaceId: string) => void;
}

/** doc 21 §4.1/§4.2 — tenant/workspace switching lives in the global
 * header, not a permanent sidebar. Availability of other workspaces is
 * permission-controlled by whatever the caller passes in `workspaces`. */
export function WorkspaceSwitcher({ current, workspaces, onSelect }: WorkspaceSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-erms-sm px-2 py-1.5 text-sm font-medium text-erms-fg hover:bg-erms-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        <Building2 className="h-4 w-4 text-erms-muted" aria-hidden="true" />
        <span>{current.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-erms-muted" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.id} onSelect={() => onSelect(workspace.id)}>
            <span className="flex h-3.5 w-3.5 items-center justify-center">
              {workspace.id === current.id ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            </span>
            {workspace.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
