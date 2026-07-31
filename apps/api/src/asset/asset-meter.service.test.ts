import { runWithTenant } from '../tenant/tenant-context.js';

import { AssetMeterService } from './asset-meter.service.js';

function buildAuditMock() {
  return { record: jest.fn().mockResolvedValue(undefined) };
}

function buildDomainEventsMock() {
  return { publish: jest.fn().mockResolvedValue('event-id'), publishStandalone: jest.fn() };
}

describe('AssetMeterService.recordReading — rollback protection', () => {
  it('flags a reading lower than the current value as an anomaly and does not apply it', async () => {
    const meter = { id: 'meter-1', assetId: 'asset-1', currentValue: '100.000000', lifetimeValue: '100.000000' };
    const reading = { id: 'reading-1', readingAt: new Date() };
    const tx = {
      assetMeterReading: { create: jest.fn().mockResolvedValue(reading) },
      assetMeter: { update: jest.fn() },
    };
    const prisma = {
      assetMeter: { findUnique: jest.fn().mockResolvedValue(meter) },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)),
    };
    const audit = buildAuditMock();
    const domainEvents = buildDomainEventsMock();
    const service = new AssetMeterService(prisma as never, audit as never, domainEvents as never);

    const result = await runWithTenant({ tenantId: 'tenant-1' }, () =>
      service.recordReading('meter-1', { readingValue: 90, source: 'manual' }, 'user-1'),
    );

    expect(tx.assetMeterReading.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ qualityStatus: 'anomaly' }) }),
    );
    expect(tx.assetMeter.update).not.toHaveBeenCalled();
    expect(result.meter).toBe(meter); // unchanged
    expect(domainEvents.publish).toHaveBeenCalledWith(tx, expect.objectContaining({ eventType: 'AssetMeterAnomalyFlagged' }));
  });

  it('applies a valid (equal or higher) reading and updates the meter counters', async () => {
    const meter = { id: 'meter-1', assetId: 'asset-1', currentValue: '100.000000', lifetimeValue: '100.000000' };
    const reading = { id: 'reading-1', readingAt: new Date() };
    const updatedMeter = { ...meter, currentValue: '120.000000' };
    const tx = {
      assetMeterReading: { create: jest.fn().mockResolvedValue(reading) },
      assetMeter: { update: jest.fn().mockResolvedValue(updatedMeter) },
    };
    const prisma = {
      assetMeter: { findUnique: jest.fn().mockResolvedValue(meter) },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)),
    };
    const audit = buildAuditMock();
    const domainEvents = buildDomainEventsMock();
    const service = new AssetMeterService(prisma as never, audit as never, domainEvents as never);

    const result = await runWithTenant({ tenantId: 'tenant-1' }, () =>
      service.recordReading('meter-1', { readingValue: 120, source: 'telematics' }, 'user-1'),
    );

    expect(tx.assetMeterReading.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ qualityStatus: 'ok' }) }),
    );
    expect(tx.assetMeter.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ currentValue: 120, lifetimeValue: { increment: 20 } }) }),
    );
    expect(result.meter).toBe(updatedMeter);
    expect(domainEvents.publish).toHaveBeenCalledWith(tx, expect.objectContaining({ eventType: 'AssetMeterReadingRecorded' }));
  });
});
