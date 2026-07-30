import { ChevronsUpDown, MapPin } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';

export interface ScopeOption {
  id: string;
  name: string;
}

export interface ScopeSelectorProps {
  label: string;
  options: ScopeOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

/** Branch/legal-entity/project scope filter, shared across every list and
 * dashboard screen (doc 21 §4.1, §13.1). Presentational only — the caller
 * owns what "scope" narrows (query params, ABAC-filtered results, etc). */
export function ScopeSelector({ label, options, selectedIds, onChange }: ScopeSelectorProps) {
  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
  }

  const summary =
    selectedIds.length === 0
      ? 'All'
      : selectedIds.length === 1
        ? (options.find((option) => option.id === selectedIds[0])?.name ?? '1 selected')
        : `${selectedIds.length} selected`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-erms-sm border border-erms-border px-2 py-1.5 text-sm text-erms-fg hover:bg-erms-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        <MapPin className="h-3.5 w-3.5 text-erms-muted" aria-hidden="true" />
        <span className="text-erms-muted">{label}:</span>
        <span className="font-medium">{summary}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-erms-muted" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.id}
            checked={selectedIds.includes(option.id)}
            onSelect={(event) => {
              event.preventDefault();
              toggle(option.id);
            }}
          >
            {option.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
