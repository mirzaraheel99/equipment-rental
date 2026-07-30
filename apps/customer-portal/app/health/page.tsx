import { Badge, PageContainer } from '@erms/ui';

export default function HealthPage() {
  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Health</h1>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-erms-muted">Customer portal:</span>
        <Badge variant="success">OK</Badge>
      </div>
    </PageContainer>
  );
}
