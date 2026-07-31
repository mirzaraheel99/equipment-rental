import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateAssetMeterDto, RecordAssetMeterReadingDto } from './dto/asset-meter.dto.js';

/**
 * Manual entry is a first-class path here, not an edge case (domain doc
 * §9, §21 Open Question 3) — `RecordAssetMeterReadingDto.source` accepts
 * `manual` on equal footing with `telematics`. A reading lower than the
 * meter's current value is never applied to the counters — it is stored
 * for review with `qualityStatus = 'anomaly'` (rollback protection).
 */
@Injectable()
export class AssetMeterService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(assetId: string, dto: CreateAssetMeterDto, actorUserId?: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException(`Asset ${assetId} not found.`);

    try {
      const meter = await this.prisma.assetMeter.create({
        data: {
          id: generateId(),
          tenantId: requireTenantId(),
          assetId,
          meterType: dto.meterType,
          unitCode: dto.unitCode,
        },
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'asset.meter.create',
        domainCode: 'asset',
        entityType: 'AssetMeter',
        entityId: meter.id,
        newValues: meter,
      });

      return meter;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Asset ${assetId} already has a ${dto.meterType} meter.`);
      }
      throw error;
    }
  }

  async findAllForAsset(assetId: string) {
    return this.prisma.assetMeter.findMany({ where: { assetId }, include: { readings: { orderBy: { readingAt: 'desc' }, take: 20 } } });
  }

  async recordReading(meterId: string, dto: RecordAssetMeterReadingDto, actorUserId: string) {
    const meter = await this.prisma.assetMeter.findUnique({ where: { id: meterId } });
    if (!meter) throw new NotFoundException(`Asset meter ${meterId} not found.`);

    const isAnomaly = dto.readingValue < Number(meter.currentValue);

    const result = await this.prisma.$transaction(async (tx) => {
      const reading = await tx.assetMeterReading.create({
        data: {
          id: generateId(),
          tenantId: requireTenantId(),
          assetMeterId: meterId,
          readingValue: dto.readingValue,
          source: dto.source,
          sourceEntityId: dto.sourceEntityId ?? null,
          capturedBy: actorUserId,
          isEstimated: false,
          qualityStatus: isAnomaly ? 'anomaly' : 'ok',
        },
      });

      let updatedMeter = meter;
      if (!isAnomaly) {
        const delta = dto.readingValue - Number(meter.currentValue);
        updatedMeter = await tx.assetMeter.update({
          where: { id: meterId },
          data: {
            currentValue: dto.readingValue,
            lifetimeValue: { increment: delta },
            lastReadingAt: reading.readingAt,
            lastReadingSource: dto.source,
            rowVersion: { increment: 1 },
          },
        });
      }

      await this.domainEvents.publish(tx, {
        eventType: isAnomaly ? 'AssetMeterAnomalyFlagged' : 'AssetMeterReadingRecorded',
        eventVersion: 1,
        aggregateType: 'Asset',
        aggregateId: meter.assetId,
        payload: { meterId, readingValue: dto.readingValue, source: dto.source },
      });

      return { reading, meter: updatedMeter };
    });

    await this.audit.record({
      actorUserId,
      actorType: 'user',
      actionCode: isAnomaly ? 'asset.meter.anomaly' : 'asset.meter.reading',
      domainCode: 'asset',
      entityType: 'AssetMeter',
      entityId: meterId,
      newValues: result.reading,
    });

    return result;
  }
}
