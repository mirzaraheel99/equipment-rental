import { Badge, Button } from '@erms/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Button> = {
  title: 'Foundation/Button',
  component: Button,
  args: { children: 'Save' },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Destructive: Story = { args: { variant: 'destructive' } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Compact: Story = { args: { density: 'compact' } };
export const Dense: Story = { args: { density: 'dense' } };

export const BadgeGallery: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="success">Available</Badge>
      <Badge variant="warning">PPM Due</Badge>
      <Badge variant="danger">Overdue</Badge>
      <Badge variant="info">In Transit</Badge>
    </div>
  ),
};
