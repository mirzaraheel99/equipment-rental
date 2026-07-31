import { BadRequestException, ConflictException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { runWithTenant } from '../tenant/tenant-context.js';

import { AssetService } from './asset.service.js';

function buildAuditMock() {
  return { record: jest.fn().mockResolvedValue(undefined) };
}

function buildDomainEventsMock() {
  return {
    publish: jest.fn().mockResolvedValue('event-id'),
    publishStandalone: jest.fn().mockResolvedValue('event-id'),
  };
}

describe('AssetService.transitionStatus (the Golden Rule)', () => {
  it('rejects an invalid transition and publishes AssetStatusTransitionRejected', async () => {
    const asset = { id: 'asset-1', currentStatusCode: 'Sold', rowVersion: 3 };
    const prisma = {
      asset: { findUnique: jest.fn().mockResolvedValue(asset) },
    };
    const audit = buildAuditMock();
    const domainEvents = buildDomainEventsMock();
    const service = new AssetService(prisma as never, audit as never, domainEvents as never);

    await runWithTenant({ tenantId: 'tenant-1' }, async () => {
      await expect(
        service.transitionStatus('asset-1', { toStatus: 'Rented', expectedRowVersion: 3 }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    expect(domainEvents.publishStandalone).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'AssetStatusTransitionRejected' }),
    );
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('rejects a stale row version (cross-module lock simulation) without applying the change', async () => {
    const asset = { id: 'asset-1', currentStatusCode: 'Available', rowVersion: 3 };
    const staleWinnerAsset = { id: 'asset-1', currentStatusCode: 'InService', rowVersion: 4 };
    const tx = {
      asset: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }), // lost the race
      },
    };
    const prisma = {
      asset: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(asset) // initial read in transitionStatus
          .mockResolvedValueOnce(staleWinnerAsset), // re-read after losing the CAS
      },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)),
    };
    const audit = buildAuditMock();
    const domainEvents = buildDomainEventsMock();
    const service = new AssetService(prisma as never, audit as never, domainEvents as never);

    await runWithTenant({ tenantId: 'tenant-1' }, async () => {
      await expect(
        service.transitionStatus('asset-1', { toStatus: 'Reserved', expectedRowVersion: 3 }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    expect(tx.asset.updateMany).toHaveBeenCalledWith({
      where: { id: 'asset-1', rowVersion: 3 },
      data: { currentStatusCode: 'Reserved', rowVersion: { increment: 1 } },
    });
    expect(domainEvents.publishStandalone).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'AssetStatusTransitionRejected', payload: expect.objectContaining({ reasonCode: 'stale_row_version' }) }),
    );
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('applies a valid transition, records history, and audits it', async () => {
    const asset = { id: 'asset-1', currentStatusCode: 'Available', rowVersion: 3 };
    const refreshed = { id: 'asset-1', currentStatusCode: 'Reserved', rowVersion: 4 };
    const tx = {
      asset: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue(refreshed),
      },
      assetStatusHistory: { create: jest.fn().mockResolvedValue(undefined) },
    };
    const prisma = {
      asset: { findUnique: jest.fn().mockResolvedValue(asset) },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)),
    };
    const audit = buildAuditMock();
    const domainEvents = buildDomainEventsMock();
    const service = new AssetService(prisma as never, audit as never, domainEvents as never);

    const result = await runWithTenant({ tenantId: 'tenant-1' }, () =>
      service.transitionStatus('asset-1', { toStatus: 'Reserved', expectedRowVersion: 3 }, 'user-1'),
    );

    expect(result).toEqual(refreshed);
    expect(tx.assetStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ previousStatusCode: 'Available', newStatusCode: 'Reserved' }),
      }),
    );
    expect(domainEvents.publish).toHaveBeenCalledWith(tx, expect.objectContaining({ eventType: 'AssetStatusChanged' }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ actionCode: 'asset.status.transition' }));
  });
});

describe('AssetService.create — duplicate serial/code rejection', () => {
  it('translates a unique-constraint violation into a ConflictException', async () => {
    const category = { id: 'cat-1' };
    const prisma = {
      assetCategory: { findUnique: jest.fn().mockResolvedValue(category) },
      $transaction: jest
        .fn()
        .mockRejectedValue(new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: '7.9.1' })),
    };
    const audit = buildAuditMock();
    const domainEvents = buildDomainEventsMock();
    const service = new AssetService(prisma as never, audit as never, domainEvents as never);

    await runWithTenant({ tenantId: 'tenant-1' }, async () => {
      await expect(
        service.create(
          {
            assetCode: 'A-1000',
            serialNumber: 'SN-1000',
            assetCategoryId: 'cat-1',
            ownershipType: 'owned',
            owningLegalEntityId: 'le-1',
            owningBranchId: 'branch-1',
          },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });
});
