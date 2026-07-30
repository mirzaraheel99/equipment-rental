import { DataTable, StatusBadge, type ColumnDef } from '@erms/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

interface AssetRow {
  id: string;
  assetCode: string;
  category: string;
  status: 'active' | 'pending' | 'blocked';
}

const rows: AssetRow[] = [
  { id: '1', assetCode: 'A-1024', category: 'Excavator', status: 'active' },
  { id: '2', assetCode: 'A-1025', category: 'Generator', status: 'pending' },
  { id: '3', assetCode: 'A-1026', category: 'Compressor', status: 'blocked' },
];

const columns: ColumnDef<AssetRow, unknown>[] = [
  { accessorKey: 'assetCode', header: 'Asset Code' },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => <StatusBadge category={info.getValue<AssetRow['status']>()} label={info.getValue<string>()} />,
  },
];

const meta: Meta<typeof DataTable<AssetRow>> = {
  title: 'Foundation/DataTable',
  render: (args) => <DataTable {...args} />,
};
export default meta;

type Story = StoryObj<typeof DataTable<AssetRow>>;

export const Default: Story = {
  args: {
    columns,
    data: rows,
    getRowId: (row: AssetRow) => row.id,
    pagination: { pageIndex: 1, pageSize: 25, totalItems: rows.length },
  },
};

export const Loading: Story = {
  args: { columns, data: [], getRowId: (row: AssetRow) => row.id, loading: true },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    getRowId: (row: AssetRow) => row.id,
    emptyState: { title: 'No assets match these filters' },
  },
};

export const ErrorRetry: Story = {
  args: { columns, data: [], getRowId: (row: AssetRow) => row.id, error: "Couldn't load assets.", onRetry: () => undefined },
};

export const Dense: Story = {
  args: { columns, data: rows, getRowId: (row: AssetRow) => row.id, density: 'dense' },
};
