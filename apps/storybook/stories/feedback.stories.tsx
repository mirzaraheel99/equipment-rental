import { Alert, PageContainer, Skeleton, Spinner } from '@erms/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = { title: 'Foundation/Feedback' };
export default meta;

export const Alerts: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Alert variant="info" title="Info">
        Informational message.
      </Alert>
      <Alert variant="success" title="Success">
        Action completed successfully.
      </Alert>
      <Alert variant="warning" title="Warning">
        Review before continuing.
      </Alert>
      <Alert variant="danger" title="Error">
        Something went wrong.
      </Alert>
    </div>
  ),
};

export const LoadingSpinner: StoryObj = { render: () => <Spinner label="Loading assets" /> };

export const SkeletonLoading: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Skeleton style={{ height: 16, width: 240 }} />
      <Skeleton style={{ height: 16, width: 180 }} />
      <Skeleton style={{ height: 16, width: 200 }} />
    </div>
  ),
};

export const PageContainerDefault: StoryObj = {
  render: () => (
    <PageContainer>
      <p>Content constrained to the shared max-width page container.</p>
    </PageContainer>
  ),
};
