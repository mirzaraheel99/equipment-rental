import { EmptyState, ErrorState, KpiCard, STATUS_BADGE_CATEGORIES, StatusBadge } from '@erms/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DollarSign } from 'lucide-react';

const statusMeta: Meta<typeof StatusBadge> = {
  title: 'Foundation/StatusBadge',
  component: StatusBadge,
};
export default statusMeta;

type StatusStory = StoryObj<typeof StatusBadge>;

export const Default: StatusStory = { args: { category: 'active', label: 'On Hire' } };
export const WithTooltip: StatusStory = {
  args: { category: 'warning', label: 'PPM Due', tooltip: 'Last inspected 3 days ago' },
};

export const AllCategories: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {STATUS_BADGE_CATEGORIES.map((category) => (
        <StatusBadge key={category} category={category} label={category} />
      ))}
    </div>
  ),
};

export const EmptyStateDefault: StoryObj = {
  render: () => <EmptyState title="No reservations today" description="Try widening the date range or clearing filters." />,
};

export const ErrorStateDefault: StoryObj = {
  render: () => (
    <ErrorState message="Couldn't load assets." correlationId="c7a1e2f0-1234" onRetry={() => undefined} />
  ),
};

export const KpiCardDefault: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <KpiCard
        title="Assets on hire"
        value="248"
        icon={DollarSign}
        trend={{ direction: 'up', label: '+12%' }}
        trendTone="success"
        subtitle="vs. last 7 days"
      />
      <KpiCard title="Loading example" value="—" loading />
    </div>
  ),
};
