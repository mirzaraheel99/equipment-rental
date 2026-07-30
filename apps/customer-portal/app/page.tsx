import { Badge, PageContainer } from '@erms/ui';

export default function PortalHomePage() {
  return (
    <PageContainer>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">ERMS Customer Portal — Bootstrap</h1>
        <Badge variant="success">Setup OK</Badge>
      </div>
      <p className="mt-2 max-w-2xl text-erms-muted">
        Isolated from the internal operations app by design (separate app, separate auth scope — see
        docs/09-Implementation/24-CODEX-IMPLEMENTATION-ROADMAP.md Phase 17). No customer-facing
        screens exist yet.
      </p>
    </PageContainer>
  );
}
