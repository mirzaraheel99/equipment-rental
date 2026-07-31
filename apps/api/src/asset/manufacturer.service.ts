import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { diffEntities } from '../audit/entity-diff.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateManufacturerDto, UpdateManufacturerDto } from './dto/manufacturer.dto.js';

@Injectable()
export class ManufacturerService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(dto: CreateManufacturerDto, actorUserId?: string) {
    const id = generateId();
    try {
      const manufacturer = await this.prisma.$transaction(async (tx) => {
        const created = await tx.manufacturer.create({
          data: {
            id,
            tenantId: requireTenantId(),
            manufacturerCode: dto.manufacturerCode,
            name: dto.name,
            countryCode: dto.countryCode ?? null,
            status: 'active',
          },
        });

        await this.domainEvents.publish(tx, {
          eventType: 'ManufacturerCreated',
          eventVersion: 1,
          aggregateType: 'Manufacturer',
          aggregateId: created.id,
          payload: { manufacturerCode: created.manufacturerCode },
        });

        return created;
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'manufacturer.create',
        domainCode: 'asset',
        entityType: 'Manufacturer',
        entityId: manufacturer.id,
        newValues: manufacturer,
      });

      return manufacturer;
    } catch (error) {
      throw this.translateError(error, dto.manufacturerCode);
    }
  }

  async findAll(page: number, pageSize: number) {
    const [items, totalItems] = await Promise.all([
      this.prisma.manufacturer.findMany({
        orderBy: { manufacturerCode: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.manufacturer.count(),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const manufacturer = await this.prisma.manufacturer.findUnique({ where: { id } });
    if (!manufacturer) throw new NotFoundException(`Manufacturer ${id} not found.`);
    return manufacturer;
  }

  async update(id: string, dto: UpdateManufacturerDto, actorUserId?: string) {
    const before = await this.findOne(id);

    try {
      const after = await this.prisma.manufacturer.update({ where: { id }, data: dto });

      const { previousValues, newValues } = diffEntities(before, after);
      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'manufacturer.update',
        domainCode: 'asset',
        entityType: 'Manufacturer',
        entityId: id,
        previousValues,
        newValues,
      });

      return after;
    } catch (error) {
      throw this.translateError(error, dto.name);
    }
  }

  private translateError(error: unknown, context?: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(`Manufacturer already exists${context ? ` (${context})` : ''}.`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}
