import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { diffEntities } from '../audit/entity-diff.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto.js';

@Injectable()
export class DepartmentService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(dto: CreateDepartmentDto, actorUserId?: string) {
    const legalEntity = await this.prisma.legalEntity.findUnique({ where: { id: dto.legalEntityId } });
    if (!legalEntity) throw new NotFoundException(`Legal entity ${dto.legalEntityId} not found.`);

    if (dto.parentDepartmentId) {
      const parent = await this.prisma.department.findUnique({ where: { id: dto.parentDepartmentId } });
      if (!parent) throw new NotFoundException(`Parent department ${dto.parentDepartmentId} not found.`);
    }

    const id = generateId();
    try {
      const department = await this.prisma.$transaction(async (tx) => {
        const created = await tx.department.create({
          data: {
            id,
            tenantId: requireTenantId(),
            legalEntityId: dto.legalEntityId,
            branchId: dto.branchId ?? null,
            parentDepartmentId: dto.parentDepartmentId ?? null,
            departmentCode: dto.departmentCode,
            nameEn: dto.nameEn,
            nameAr: dto.nameAr ?? null,
            status: 'pending',
          },
        });

        await this.domainEvents.publish(tx, {
          eventType: 'DepartmentCreated',
          eventVersion: 1,
          aggregateType: 'Department',
          aggregateId: created.id,
          payload: { departmentCode: created.departmentCode },
        });

        return created;
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'department.create',
        domainCode: 'platform',
        entityType: 'Department',
        entityId: department.id,
        newValues: department,
      });

      return department;
    } catch (error) {
      throw this.translateError(error, dto.departmentCode);
    }
  }

  async findAll(page: number, pageSize: number, legalEntityId?: string) {
    const where = legalEntityId ? { legalEntityId } : {};
    const [items, totalItems] = await Promise.all([
      this.prisma.department.findMany({
        where,
        orderBy: { departmentCode: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.department.count({ where }),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException(`Department ${id} not found.`);
    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto, actorUserId?: string) {
    const before = await this.findOne(id);

    if (dto.parentDepartmentId) {
      await this.assertNoCycle(id, dto.parentDepartmentId);
    }

    try {
      const after = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.department.update({
          where: { id },
          data: dto,
        });

        if (dto.status && dto.status !== before.status) {
          await this.domainEvents.publish(tx, {
            eventType: 'DepartmentStatusChanged',
            eventVersion: 1,
            aggregateType: 'Department',
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
        actionCode: 'department.update',
        domainCode: 'platform',
        entityType: 'Department',
        entityId: id,
        previousValues,
        newValues,
      });

      return after;
    } catch (error) {
      throw this.translateError(error, dto.nameEn);
    }
  }

  /** Circular parent relationships are prohibited (dictionary §6.5) — walks
   * the proposed parent's own ancestor chain to confirm it never reaches
   * back to the department being moved. */
  private async assertNoCycle(departmentId: string, proposedParentId: string): Promise<void> {
    if (departmentId === proposedParentId) {
      throw new BadRequestException('A department cannot be its own parent.');
    }

    let currentId: string | null = proposedParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === departmentId) {
        throw new BadRequestException('This change would create a circular department hierarchy.');
      }
      if (visited.has(currentId)) break;
      visited.add(currentId);

      const current: { parentDepartmentId: string | null } | null = await this.prisma.department.findUnique({
        where: { id: currentId },
        select: { parentDepartmentId: true },
      });
      currentId = current?.parentDepartmentId ?? null;
    }
  }

  private translateError(error: unknown, context?: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(`Department already exists${context ? ` (${context})` : ''}.`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}
