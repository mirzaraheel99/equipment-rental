import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { diffEntities } from '../audit/entity-diff.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';

@Injectable()
export class BranchService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(dto: CreateBranchDto, actorUserId?: string) {
    const legalEntity = await this.prisma.legalEntity.findUnique({ where: { id: dto.legalEntityId } });
    if (!legalEntity) throw new NotFoundException(`Legal entity ${dto.legalEntityId} not found.`);

    const id = generateId();
    try {
      const branch = await this.prisma.$transaction(async (tx) => {
        const created = await tx.branch.create({
          data: {
            id,
            tenantId: requireTenantId(),
            legalEntityId: dto.legalEntityId,
            branchCode: dto.branchCode,
            nameEn: dto.nameEn,
            nameAr: dto.nameAr ?? null,
            branchType: dto.branchType,
            regionId: dto.regionId ?? null,
            cityId: dto.cityId ?? null,
            addressJson: dto.addressJson ?? Prisma.DbNull,
            timezone: dto.timezone,
            status: 'pending',
          },
        });

        await this.domainEvents.publish(tx, {
          eventType: 'BranchCreated',
          eventVersion: 1,
          aggregateType: 'Branch',
          aggregateId: created.id,
          payload: { branchCode: created.branchCode, branchType: created.branchType },
        });

        return created;
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'branch.create',
        domainCode: 'platform',
        entityType: 'Branch',
        entityId: branch.id,
        newValues: branch,
      });

      return branch;
    } catch (error) {
      throw this.translateError(error, dto.branchCode);
    }
  }

  async findAll(page: number, pageSize: number, legalEntityId?: string) {
    const where = legalEntityId ? { legalEntityId } : {};
    const [items, totalItems] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        orderBy: { branchCode: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.branch.count({ where }),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException(`Branch ${id} not found.`);
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto, actorUserId?: string) {
    const before = await this.findOne(id);

    try {
      const after = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.branch.update({
          where: { id },
          data: { ...dto, rowVersion: { increment: 1 } },
        });

        if (dto.status && dto.status !== before.status) {
          await this.domainEvents.publish(tx, {
            eventType: 'BranchStatusChanged',
            eventVersion: 1,
            aggregateType: 'Branch',
            aggregateId: updated.id,
            payload: { from: before.status, to: updated.status },
          });
        }

        return updated;
      });

      const { previousValues, newValues } = diffEntities(before, after);
      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'branch.update',
        domainCode: 'platform',
        entityType: 'Branch',
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
      return new ConflictException(`Branch already exists${context ? ` (${context})` : ''}.`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}
