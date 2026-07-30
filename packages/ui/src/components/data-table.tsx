'use client';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

import { cn } from '../lib/cn';

import { EmptyState, type EmptyStateProps } from './empty-state';
import { ErrorState } from './error-state';
import { Skeleton } from './skeleton';

export type DataTableDensity = 'comfortable' | 'compact' | 'dense';

const ROW_PADDING: Record<DataTableDensity, string> = {
  comfortable: 'py-3',
  compact: 'py-2',
  dense: 'py-1',
};

export interface DataTablePaginationState {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Stable row id — required for accessible row semantics and safe
   * re-renders (doc 21 §12.5 — no index-keyed rows). */
  getRowId: (row: TData) => string;
  density?: DataTableDensity;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyState?: Pick<EmptyStateProps, 'title' | 'description' | 'icon' | 'action'>;
  pagination?: DataTablePaginationState;
  onPageChange?: (pageIndex: number) => void;
  /** Omit for client-side sorting of the current page; pass to drive
   * server-side sorting instead (manual mode — doc 21 §12.1). */
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  onRowClick?: (row: TData) => void;
  className?: string;
}

/**
 * The one data-table implementation every module reuses (roadmap Phase 04
 * Definition of Done). Column resize/reorder/pinning and virtualization
 * (doc 21 §12.1/§12.5) are explicitly deferred — see the Design System
 * Decision Register entry for this phase; this covers search-adjacent
 * sorting, pagination, density, and the three required states.
 */
export function DataTable<TData>({
  columns,
  data,
  getRowId,
  density = 'compact',
  loading,
  error,
  onRetry,
  emptyState,
  pagination,
  onPageChange,
  sorting: controlledSorting,
  onSortingChange,
  onRowClick,
  className,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const manualSorting = controlledSorting !== undefined;

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualSorting,
    manualPagination: true,
    getRowId,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      if (onSortingChange) onSortingChange(next);
      else setInternalSorting(next);
    },
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
  });

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} className={className} />;
  }

  const rows = table.getRowModel().rows;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize)) : 1;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="overflow-x-auto rounded-erms-md border border-erms-border">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-erms-border bg-erms-border/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-3 py-2 text-start font-medium text-erms-muted"
                      aria-sort={sortState === 'asc' ? 'ascending' : sortState === 'desc' ? 'descending' : 'none'}
                    >
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortState === 'asc' ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : sortState === 'desc' ? (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b border-erms-border last:border-0">
                  {columns.map((column, colIndex) => (
                    <td key={column.id ?? colIndex} className={cn('px-3', ROW_PADDING[density])}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyState?.title ?? 'No records found'}
                    description={emptyState?.description}
                    icon={emptyState?.icon}
                    action={emptyState?.action}
                    className="rounded-none border-0"
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'border-b border-erms-border last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-erms-border/10',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cn('px-3', ROW_PADDING[density])}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && rows.length > 0 ? (
        <div className="flex items-center justify-between text-xs text-erms-muted">
          <span>
            {pagination.totalItems} result{pagination.totalItems === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.pageIndex <= 1}
              onClick={() => onPageChange?.(pagination.pageIndex - 1)}
              className="rounded-erms-sm border border-erms-border px-2 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {pagination.pageIndex} of {totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.pageIndex >= totalPages}
              onClick={() => onPageChange?.(pagination.pageIndex + 1)}
              className="rounded-erms-sm border border-erms-border px-2 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type { ColumnDef } from '@tanstack/react-table';
