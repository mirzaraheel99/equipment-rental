import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { diffEntities } from '../audit/entity-diff.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import { isValidTransition, type AssetStatus } from './asset-status.js';
import type { TransferAssetLocationDto } from './dto/asset-location.dto.js';
import type { TransitionAssetStatusDto } from './dto/asset-status-transition.dto.js';
import type { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto.js';

/**
 * The Golden Rule's implementing service (domain doc §2): `currentStatusCode`
 * and `currentLocationId` are only ever written here, via a compare-and-swap
 * on `rowVersion` — never a bare `update`. A losing concurrent writer gets a
 * `ConflictException` naming the row version it expected vs. the asset's
 * actual current state, not a silent overwrite or an indefinite queue
 * (§12, Cross-Module Status Write Lock).
 */
@Injectable()
export class AssetService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(dto: CreateAssetDto, actorUserId?: string) {
    const category = await this.prisma.assetCategory.findUnique({ where: { id: dto.assetCategoryId } });
    if (!category) throw new NotFoundException(`Asset category ${dto.assetCategoryId} not found.`);

    if (dto.initialLocationId) {
      const location = await this.prisma.assetLocation.findUnique({ where: { id: dto.initialLocationId } });
      if (!location) throw new NotFoundException(`Asset location ${dto.initialLocationId} not found.`);
    }

    const id = generateId();
    try {
      const asset = await this.prisma.$transaction(async (tx) => {
        const created = await tx.asset.create({
          data: {
            id,
            tenantId: requireTenantId(),
            assetCode: dto.assetCode,
            serialNumber: dto.serialNumber ?? null,
            manufacturerId: dto.manufacturerId ?? null,
            equipmentModelId: dto.equipmentModelId ?? null,
            assetCategoryId: dto.assetCategoryId,
            ownershipType: dto.ownershipType,
            owningLegalEntityId: dto.owningLegalEntityId,
            owningBranchId: dto.owningBranchId,
            currentStatusCode: 'Available' satisfies AssetStatus,
            currentLocationId: dto.initialLocationId ?? null,
            purchaseDate: dto.purchaseDate ?? null,
            purchaseCost: dto.purchaseCost ?? null,
            replacementValue: dto.replacementValue ?? null,
            warrantyStartDate: dto.warrantyStartDate ?? null,
            warrantyEndDate: dto.warrantyEndDate ?? null,
            engineNumber: dto.engineNumber ?? null,
            vin: dto.vin ?? null,
            licensePlate: dto.licensePlate ?? null,
            barcode: dto.barcode ?? null,
            qrCode: dto.qrCode ?? null,
            rfidTag: dto.rfidTag ?? null,
            specificationJson: dto.specificationJson ?? Prisma.DbNull,
            commissionedAt: new Date(),
          },
        });

        await tx.assetStatusHistory.create({
          data: {
            id: generateId(),
            tenantId: requireTenantId(),
            assetId: created.id,
            previousStatusCode: null,
            newStatusCode: created.currentStatusCode,
            reasonCode: 'onboarded',
            sourceDomain: 'asset',
            changedBy: actorUserId ?? null,
          },
        });

        if (dto.initialLocationId) {
          await tx.assetLocationHistory.create({
            data: {
              id: generateId(),
              tenantId: requireTenantId(),
              assetId: created.id,
              fromLocationId: null,
              toLocationId: dto.initialLocationId,
              movementType: 'initial',
              sourceDomain: 'asset',
              movedBy: actorUserId ?? null,
              verifiedMethod: 'manual',
            },
          });
        }

        await this.domainEvents.publish(tx, {
          eventType: 'AssetCreated',
          eventVersion: 1,
          aggregateType: 'Asset',
          aggregateId: created.id,
          payload: { assetCode: created.assetCode, status: created.currentStatusCode },
        });

        return created;
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'asset.create',
        domainCode: 'asset',
        entityType: 'Asset',
        entityId: asset.id,
        newValues: asset,
      });

      return asset;
    } catch (error) {
      throw this.translateError(error, dto.assetCode);
    }
  }

  async findAll(
    page: number,
    pageSize: number,
    filters: { branchId?: string | undefined; statusCode?: string | undefined } = {},
  ) {
    const where = {
      ...(filters.branchId ? { owningBranchId: filters.branchId } : {}),
      ...(filters.statusCode ? { currentStatusCode: filters.statusCode } : {}),
    };
    const [items, totalItems] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        orderBy: { assetCode: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.asset.count({ where }),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Asset ${id} not found.`);
    return asset;
  }

  /** Asset 360° view (domain doc §14) — this pass aggregates only what this
   * domain itself owns (status/location history, meters, documents);
   * cross-domain projections (active contract, open work orders, PPM
   * schedule) are deferred until those domains exist to read from. */
  async findOneWithHistory(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        statusHistory: { orderBy: { changedAt: 'desc' } },
        locationHistory: { orderBy: { movedAt: 'desc' } },
        meters: true,
        documents: true,
        currentLocation: true,
      },
    });
    if (!asset) throw new NotFoundException(`Asset ${id} not found.`);
    return asset;
  }

  async update(id: string, dto: UpdateAssetDto, actorUserId?: string) {
    const before = await this.findOne(id);

    try {
      const after = await this.prisma.asset.update({
        where: { id },
        data: {
          ...(dto.manufacturerId !== undefined ? { manufacturerId: dto.manufacturerId } : {}),
          ...(dto.equipmentModelId !== undefined ? { equipmentModelId: dto.equipmentModelId } : {}),
          ...(dto.warrantyStartDate !== undefined ? { warrantyStartDate: dto.warrantyStartDate } : {}),
          ...(dto.warrantyEndDate !== undefined ? { warrantyEndDate: dto.warrantyEndDate } : {}),
          ...(dto.licensePlate !== undefined ? { licensePlate: dto.licensePlate } : {}),
          ...(dto.specificationJson !== undefined ? { specificationJson: dto.specificationJson } : {}),
          rowVersion: { increment: 1 },
        },
      });

      const { previousValues, newValues } = diffEntities(before, after);
      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'asset.update',
        domainCode: 'asset',
        entityType: 'Asset',
        entityId: id,
        previousValues,
        newValues,
      });

      return after;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async transitionStatus(assetId: string, dto: TransitionAssetStatusDto, actorUserId: string) {
    const asset = await this.findOne(assetId);
    const fromStatus = asset.currentStatusCode as AssetStatus;

    if (!isValidTransition(fromStatus, dto.toStatus)) {
      await this.publishRejection(assetId, fromStatus, dto.toStatus, 'invalid_transition');
      throw new BadRequestException(`Invalid asset status transition: ${fromStatus} -> ${dto.toStatus}.`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const casResult = await tx.asset.updateMany({
        where: { id: assetId, rowVersion: dto.expectedRowVersion },
        data: { currentStatusCode: dto.toStatus, rowVersion: { increment: 1 } },
      });
      if (casResult.count === 0) return null;

      const refreshed = await tx.asset.findUniqueOrThrow({ where: { id: assetId } });

      await tx.assetStatusHistory.create({
        data: {
          id: generateId(),
          tenantId: requireTenantId(),
          assetId,
          previousStatusCode: fromStatus,
          newStatusCode: dto.toStatus,
          reasonCode: dto.reasonCode ?? null,
          sourceDomain: 'asset',
          sourceEntityType: dto.sourceEntityType ?? null,
          sourceEntityId: dto.sourceEntityId ?? null,
          changedBy: actorUserId,
        },
      });

      await this.domainEvents.publish(tx, {
        eventType: 'AssetStatusChanged',
        eventVersion: 1,
        aggregateType: 'Asset',
        aggregateId: assetId,
        payload: { from: fromStatus, to: dto.toStatus },
      });

      return refreshed;
    });

    if (!updated) {
      const current = await this.findOne(assetId);
      await this.publishRejection(assetId, fromStatus, dto.toStatus, 'stale_row_version');
      throw new ConflictException(
        `Asset status transition rejected: expected row version ${dto.expectedRowVersion} is stale ` +
          `(asset is now at row version ${current.rowVersion}, status ${current.currentStatusCode}). Reload and retry.`,
      );
    }

    await this.audit.record({
      actorUserId,
      actorType: 'user',
      actionCode: 'asset.status.transition',
      domainCode: 'asset',
      entityType: 'Asset',
      entityId: assetId,
      previousValues: { currentStatusCode: fromStatus },
      newValues: { currentStatusCode: dto.toStatus },
      reason: dto.reasonCode,
    });

    return updated;
  }

  async transferLocation(assetId: string, dto: TransferAssetLocationDto, actorUserId: string) {
    const asset = await this.findOne(assetId);
    const toLocation = await this.prisma.assetLocation.findUnique({ where: { id: dto.toLocationId } });
    if (!toLocation) throw new NotFoundException(`Asset location ${dto.toLocationId} not found.`);

    const fromLocationId = asset.currentLocationId;

    const updated = await this.prisma.$transaction(async (tx) => {
      const casResult = await tx.asset.updateMany({
        where: { id: assetId, rowVersion: dto.expectedRowVersion },
        data: { currentLocationId: dto.toLocationId, rowVersion: { increment: 1 } },
      });
      if (casResult.count === 0) return null;

      const refreshed = await tx.asset.findUniqueOrThrow({ where: { id: assetId } });

      await tx.assetLocationHistory.create({
        data: {
          id: generateId(),
          tenantId: requireTenantId(),
          assetId,
          fromLocationId,
          toLocationId: dto.toLocationId,
          movementType: dto.movementType,
          sourceDomain: 'asset',
          sourceEntityId: dto.sourceEntityId ?? null,
          movedBy: actorUserId,
          verifiedMethod: dto.verifiedMethod ?? 'manual',
          gpsAccuracyMeters: dto.gpsAccuracyMeters ?? null,
        },
      });

      await this.domainEvents.publish(tx, {
        eventType: 'AssetLocationChanged',
        eventVersion: 1,
        aggregateType: 'Asset',
        aggregateId: assetId,
        payload: { fromLocationId, toLocationId: dto.toLocationId, movementType: dto.movementType },
      });

      return refreshed;
    });

    if (!updated) {
      const current = await this.findOne(assetId);
      throw new ConflictException(
        `Asset location transfer rejected: expected row version ${dto.expectedRowVersion} is stale ` +
          `(asset is now at row version ${current.rowVersion}). Reload and retry.`,
      );
    }

    await this.audit.record({
      actorUserId,
      actorType: 'user',
      actionCode: 'asset.location.transfer',
      domainCode: 'asset',
      entityType: 'Asset',
      entityId: assetId,
      previousValues: { currentLocationId: fromLocationId },
      newValues: { currentLocationId: dto.toLocationId },
    });

    return updated;
  }

  private async publishRejection(assetId: string, from: AssetStatus, to: AssetStatus, reasonCode: string) {
    await this.domainEvents.publishStandalone({
      eventType: 'AssetStatusTransitionRejected',
      eventVersion: 1,
      aggregateType: 'Asset',
      aggregateId: assetId,
      payload: { from, to, reasonCode },
    });
  }

  private translateError(error: unknown, context?: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(`Asset already exists${context ? ` (${context})` : ''} — duplicate code, serial number, barcode, or QR code.`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}
