import { Command } from 'cmdk';
import type { LucideIcon } from 'lucide-react';

import { cn } from '../lib/cn';

export interface CommandPaletteItem {
  id: string;
  label: string;
  /** doc 21 §18 — commands are grouped (navigation, create, recent, etc.). */
  group?: string;
  shortcut?: string;
  icon?: LucideIcon;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Already permission/role-filtered by the caller (doc 21 §18 — "role-
   * scoped commands") — the palette itself has no permission awareness. */
  items: CommandPaletteItem[];
  placeholder?: string;
}

/** Global command palette (Cmd/Ctrl+K) — the caller owns the keyboard
 * shortcut wiring and the item list; this owns search, grouping, and
 * keyboard navigation within the open palette. */
export function CommandPalette({ open, onOpenChange, items, placeholder = 'Type a command or search…' }: CommandPaletteProps) {
  const groups = new Map<string, CommandPaletteItem[]>();
  for (const item of items) {
    const key = item.group ?? 'Actions';
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command Palette"
      className={cn(
        'fixed start-1/2 top-[20%] z-[var(--z-erms-command-palette)] w-full max-w-lg -translate-x-1/2 rtl:translate-x-1/2',
        'overflow-hidden rounded-erms-lg border border-erms-border bg-[rgb(var(--erms-bg))] shadow-erms-lg',
      )}
    >
      <Command.Input
        placeholder={placeholder}
        className="w-full border-b border-erms-border bg-transparent px-4 py-3 text-sm text-erms-fg outline-none placeholder:text-erms-muted"
      />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-erms-muted">No results found.</Command.Empty>
        {[...groups.entries()].map(([group, groupItems]) => (
          <Command.Group
            key={group}
            heading={group}
            className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-erms-muted [&_[cmdk-group-items]]:mt-1"
          >
            {groupItems.map((item) => (
              <Command.Item
                key={item.id}
                onSelect={() => {
                  item.onSelect();
                  onOpenChange(false);
                }}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-erms-sm px-2 py-2 text-sm text-erms-fg',
                  'data-[selected=true]:bg-brand-500/10 data-[selected=true]:text-brand-700',
                )}
              >
                {item.icon ? <item.icon className="h-4 w-4 text-erms-muted" aria-hidden="true" /> : null}
                <span className="flex-1">{item.label}</span>
                {item.shortcut ? (
                  <kbd className="rounded-erms-sm border border-erms-border px-1.5 py-0.5 text-xs text-erms-muted">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
