import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { diffEntities } from '../audit/entity-diff.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateEquipmentModelDto, UpdateEquipmentModelDto } from './dto/equipment-model.dto.js';

@Injectable()
export class EquipmentModelService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(dto: CreateEquipmentModelDto, actorUserId?: string) {
    const [manufacturer, category] = await Promise.all([
      this.prisma.manufacturer.findUnique({ where: { id: dto.manufacturerId } }),
      this.prisma.assetCategory.findUnique({ where: { id: dto.assetCategoryId } }),
    ]);
    if (!manufacturer) throw new NotFoundException(`Manufacturer ${dto.manufacturerId} not found.`);
    if (!category) throw new NotFoundException(`Asset category ${dto.assetCategoryId} not found.`);

    const id = generateId();
    try {
      const model = await this.prisma.$transaction(async (tx) => {
        const created = await tx.equipmentModel.create({
          data: {
            id,
            tenantId: requireTenantId(),
            manufacturerId: dto.manufacturerId,
            assetCategoryId: dto.assetCategoryId,
            modelCode: dto.modelCode,
            modelName: dto.modelName,
            descriptionEn: dto.descriptionEn ?? null,
            descriptionAr: dto.descriptionAr ?? null,
            standardSpecificationJson: dto.standardSpecificationJson ?? Prisma.DbNull,
            status: 'active',
          },
        });

        await this.domainEvents.publish(tx, {
          eventType: 'EquipmentModelCreated',
          eventVersion: 1,
          aggregateType: 'EquipmentModel',
          aggregateId: created.id,
          payload: { modelCode: created.modelCode },
        });

        return created;
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'equipment_model.create',
        domainCode: 'asset',
        entityType: 'EquipmentModel',
        entityId: model.id,
        newValues: model,
      });

      return model;
    } catch (error) {
      throw this.translateError(error, dto.modelCode);
    }
  }

  async findAll(page: number, pageSize: number, manufacturerId?: string) {
    const where = manufacturerId ? { manufacturerId } : {};
    const [items, totalItems] = await Promise.all([
      this.prisma.equipmentModel.findMany({
        where,
        orderBy: { modelCode: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.equipmentModel.count({ where }),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const model = await this.prisma.equipmentModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException(`Equipment model ${id} not found.`);
    return model;
  }

  async update(id: string, dto: UpdateEquipmentModelDto, actorUserId?: string) {
    const before = await this.findOne(id);

    try {
      const after = await this.prisma.equipmentModel.update({
        where: { id },
        data: {
          ...(dto.modelName !== undefined ? { modelName: dto.modelName } : {}),
          ...(dto.descriptionEn !== undefined ? { descriptionEn: dto.descriptionEn } : {}),
          ...(dto.descriptionAr !== undefined ? { descriptionAr: dto.descriptionAr } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.standardSpecificationJson !== undefined
            ? { standardSpecificationJson: dto.standardSpecificationJson }
            : {}),
        },
      });

      const { previousValues, newValues } = diffEntities(before, after);
      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'equipment_model.update',
        domainCode: 'asset',
        entityType: 'EquipmentModel',
        entityId: id,
        previousValues,
        newValues,
      });

      return after;
    } catch (error) {
      throw this.translateError(error, dto.modelName);
    }
  }

  private translateError(error: unknown, context?: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(`Equipment model already exists${context ? ` (${context})` : ''}.`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}
