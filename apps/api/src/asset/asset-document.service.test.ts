import { runWithTenant } from '../tenant/tenant-context.js';

import { AssetDocumentService } from './asset-document.service.js';

describe('AssetDocumentService.findValidCertificates — expired certificate visibility', () => {
  it('queries for active documents with no expiry or an expiry in the future', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = { assetDocument: { findMany } };
    const audit = { record: jest.fn() };
    const domainEvents = { publish: jest.fn(), publishStandalone: jest.fn() };
    const service = new AssetDocumentService(prisma as never, audit as never, domainEvents as never);

    await runWithTenant({ tenantId: 'tenant-1' }, () => service.findValidCertificates('asset-1'));

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          assetId: 'asset-1',
          status: 'active',
          OR: [{ expiryDate: null }, { expiryDate: { gte: expect.any(Date) } }],
        }),
      }),
    );
  });
});
