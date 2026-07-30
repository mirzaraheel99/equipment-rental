import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataTable, type ColumnDef } from '../data-table';

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
];

describe('DataTable', () => {
  it('renders rows', () => {
    render(<DataTable columns={columns} data={[{ id: '1', name: 'Excavator A-100' }]} getRowId={(row) => row.id} />);

    expect(screen.getByText('Excavator A-100')).toBeInTheDocument();
  });

  it('renders an empty state when there is no data', () => {
    render(<DataTable columns={columns} data={[]} getRowId={(row) => row.id} emptyState={{ title: 'No assets found' }} />);

    expect(screen.getByText('No assets found')).toBeInTheDocument();
  });

  it('renders an error state with a retry action instead of the table body', () => {
    render(
      <DataTable columns={columns} data={[]} getRowId={(row) => row.id} error="Failed to load assets" onRetry={() => undefined} />,
    );

    expect(screen.getByText('Failed to load assets')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('renders skeleton placeholder rows while loading', () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} getRowId={(row) => row.id} loading />,
    );

    expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
  });
});
