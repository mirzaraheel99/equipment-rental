import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { diffEntities } from '../audit/entity-diff.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateAssetCategoryDto, UpdateAssetCategoryDto } from './dto/asset-category.dto.js';

@Injectable()
export class AssetCategoryService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(dto: CreateAssetCategoryDto, actorUserId?: string) {
    if (dto.parentCategoryId) {
      const parent = await this.prisma.assetCategory.findUnique({ where: { id: dto.parentCategoryId } });
      if (!parent) throw new NotFoundException(`Parent category ${dto.parentCategoryId} not found.`);
    }

    const id = generateId();
    try {
      const category = await this.prisma.$transaction(async (tx) => {
        const created = await tx.assetCategory.create({
          data: {
            id,
            tenantId: requireTenantId(),
            parentCategoryId: dto.parentCategoryId ?? null,
            categoryCode: dto.categoryCode,
            nameEn: dto.nameEn,
            nameAr: dto.nameAr ?? null,
            serializedRequired: dto.serializedRequired ?? true,
            meterRequired: dto.meterRequired ?? false,
            telematicsSupported: dto.telematicsSupported ?? false,
            operatorRequired: dto.operatorRequired ?? false,
            transportClassCode: dto.transportClassCode ?? null,
            riskClassification: dto.riskClassification,
            status: 'active',
          },
        });

        await this.domainEvents.publish(tx, {
          eventType: 'AssetCategoryCreated',
          eventVersion: 1,
          aggregateType: 'AssetCategory',
          aggregateId: created.id,
          payload: { categoryCode: created.categoryCode },
        });

        return created;
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'asset_category.create',
        domainCode: 'asset',
        entityType: 'AssetCategory',
        entityId: category.id,
        newValues: category,
      });

      return category;
    } catch (error) {
      throw this.translateError(error, dto.categoryCode);
    }
  }

  async findAll(page: number, pageSize: number) {
    const [items, totalItems] = await Promise.all([
      this.prisma.assetCategory.findMany({
        orderBy: { categoryCode: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.assetCategory.count(),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const category = await this.prisma.assetCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Asset category ${id} not found.`);
    return category;
  }

  async update(id: string, dto: UpdateAssetCategoryDto, actorUserId?: string) {
    const before = await this.findOne(id);

    try {
      const after = await this.prisma.assetCategory.update({ where: { id }, data: dto });

      const { previousValues, newValues } = diffEntities(before, after);
      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'asset_category.update',
        domainCode: 'asset',
        entityType: 'AssetCategory',
        entityId: id,
        previousValues,
        newValues,
      });

      return after;
    } catch (error) {
      throw this.translateError(error, dto.nameEn);
    }
  }

  private translateError(error: unknown, context?: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(`Asset category already exists${context ? ` (${context})` : ''}.`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}
