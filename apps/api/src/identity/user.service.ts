import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { diffEntities } from '../audit/entity-diff.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';

/**
 * Manual/admin user creation and profile management — pre-provisions a
 * `user_account` before a person's first login (e.g. an admin inviting a
 * colleague), or updates one after. First-login JIT provisioning
 * (UserProvisioningService) is the other path into this same table; see
 * docs/04-Domain/03-AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md §5.2.
 */
@Injectable()
export class UserService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(dto: CreateUserDto, actorUserId?: string) {
    const id = generateId();
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const created = await tx.userAccount.create({
          data: {
            id,
            tenantId: requireTenantId(),
            email: dto.email.toLowerCase(),
            displayName: dto.displayName,
            preferredLanguage: dto.preferredLanguage,
            timezone: dto.timezone,
            status: 'pending',
            primaryBranchId: dto.primaryBranchId ?? null,
            departmentId: dto.departmentId ?? null,
            managerUserId: dto.managerUserId ?? null,
            mfaStatus: 'not_enrolled',
          },
        });

        await this.domainEvents.publish(tx, {
          eventType: 'UserProvisioned',
          eventVersion: 1,
          aggregateType: 'UserAccount',
          aggregateId: created.id,
          payload: { email: created.email },
        });

        return created;
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'user.create',
        domainCode: 'identity',
        entityType: 'UserAccount',
        entityId: user.id,
        newValues: user,
      });

      return user;
    } catch (error) {
      throw this.translateError(error, dto.email);
    }
  }

  async findAll(page: number, pageSize: number) {
    const [items, totalItems] = await Promise.all([
      this.prisma.userAccount.findMany({
        orderBy: { email: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          displayName: true,
          status: true,
          mfaStatus: true,
          primaryBranchId: true,
          departmentId: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.userAccount.count(),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const user = await this.prisma.userAccount.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found.`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorUserId?: string) {
    const before = await this.findOne(id);

    try {
      const after = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.userAccount.update({
          where: { id },
          data: { ...dto, rowVersion: { increment: 1 } },
        });

        if (dto.status && dto.status !== before.status) {
          await this.domainEvents.publish(tx, {
            eventType: 'UserStatusChanged',
            eventVersion: 1,
            aggregateType: 'UserAccount',
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
        actionCode: 'user.update',
        domainCode: 'identity',
        entityType: 'UserAccount',
        entityId: id,
        previousValues,
        newValues,
      });

      return after;
    } catch (error) {
      throw this.translateError(error, dto.displayName);
    }
  }

  private translateError(error: unknown, context?: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(`User already exists${context ? ` (${context})` : ''}.`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}
