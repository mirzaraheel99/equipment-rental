import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { AssignRoleDto } from './dto/role-assignment.dto.js';

/**
 * Grants and revokes `user_role_assignment` rows — the surface the
 * roadmap's "permission escalation attempt" required test targets, since
 * `identity.role_assignment.manage` is flagged privileged (§9, §11): every
 * call here requires a fresh step-up grant on top of the permission itself
 * (enforced generically by PermissionsGuard).
 */
@Injectable()
export class RoleAssignmentService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async assign(dto: AssignRoleDto, actorUserId: string) {
    if (dto.scopeType === 'tenant' && dto.scopeId) {
      throw new BadRequestException('scopeId must be omitted when scopeType is "tenant".');
    }
    if (dto.scopeType !== 'tenant' && !dto.scopeId) {
      throw new BadRequestException('scopeId is required unless scopeType is "tenant".');
    }

    const [user, role] = await Promise.all([
      this.prisma.userAccount.findUnique({ where: { id: dto.userId } }),
      this.prisma.role.findUnique({ where: { id: dto.roleId } }),
    ]);
    if (!user) throw new NotFoundException(`User ${dto.userId} not found.`);
    if (!role) throw new NotFoundException(`Role ${dto.roleId} not found.`);

    const assignment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.userRoleAssignment.create({
        data: {
          id: generateId(),
          tenantId: requireTenantId(),
          userId: dto.userId,
          roleId: dto.roleId,
          scopeType: dto.scopeType,
          scopeId: dto.scopeId ?? null,
          assignmentReason: dto.assignmentReason ?? null,
          delegatedBy: actorUserId,
        },
      });

      await this.domainEvents.publish(tx, {
        eventType: 'RoleAssigned',
        eventVersion: 1,
        aggregateType: 'UserAccount',
        aggregateId: dto.userId,
        payload: { roleCode: role.roleCode, scopeType: dto.scopeType, scopeId: dto.scopeId },
      });

      return created;
    });

    await this.audit.record({
      actorUserId,
      actorType: 'user',
      actionCode: 'role_assignment.grant',
      domainCode: 'identity',
      entityType: 'UserRoleAssignment',
      entityId: assignment.id,
      newValues: assignment,
      reason: dto.assignmentReason,
    });

    return assignment;
  }

  async revoke(assignmentId: string, actorUserId: string) {
    const assignment = await this.prisma.userRoleAssignment.findUnique({
      where: { id: assignmentId },
      include: { role: true },
    });
    if (!assignment) throw new NotFoundException(`Role assignment ${assignmentId} not found.`);

    await this.prisma.$transaction(async (tx) => {
      await tx.userRoleAssignment.update({ where: { id: assignmentId }, data: { effectiveTo: new Date() } });

      await this.domainEvents.publish(tx, {
        eventType: 'RoleRevoked',
        eventVersion: 1,
        aggregateType: 'UserAccount',
        aggregateId: assignment.userId,
        payload: { roleCode: assignment.role.roleCode },
      });
    });

    await this.audit.record({
      actorUserId,
      actorType: 'user',
      actionCode: 'role_assignment.revoke',
      domainCode: 'identity',
      entityType: 'UserRoleAssignment',
      entityId: assignmentId,
      previousValues: assignment,
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.userRoleAssignment.findMany({
      where: { userId },
      include: { role: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }
}
