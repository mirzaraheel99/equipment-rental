import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { diffEntities } from '../audit/entity-diff.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateRoleDto, GrantRolePermissionDto, UpdateRoleDto } from './dto/role.dto.js';

@Injectable()
export class RoleService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(dto: CreateRoleDto, actorUserId?: string) {
    const id = generateId();
    try {
      const role = await this.prisma.$transaction(async (tx) => {
        const created = await tx.role.create({
          data: {
            id,
            tenantId: requireTenantId(),
            roleCode: dto.roleCode,
            nameEn: dto.nameEn,
            nameAr: dto.nameAr ?? null,
            roleType: 'custom',
            isSystemRole: false,
            status: 'active',
          },
        });

        await this.domainEvents.publish(tx, {
          eventType: 'RoleCreated',
          eventVersion: 1,
          aggregateType: 'Role',
          aggregateId: created.id,
          payload: { roleCode: created.roleCode },
        });

        return created;
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'role.create',
        domainCode: 'identity',
        entityType: 'Role',
        entityId: role.id,
        newValues: role,
      });

      return role;
    } catch (error) {
      throw this.translateError(error, dto.roleCode);
    }
  }

  async findAll(page: number, pageSize: number) {
    const [items, totalItems] = await Promise.all([
      this.prisma.role.findMany({
        orderBy: { roleCode: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.role.count(),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException(`Role ${id} not found.`);
    return role;
  }

  async update(id: string, dto: UpdateRoleDto, actorUserId?: string) {
    const before = await this.assertEditable(id);

    try {
      const after = await this.prisma.role.update({ where: { id }, data: dto });

      const { previousValues, newValues } = diffEntities(before, after);
      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'role.update',
        domainCode: 'identity',
        entityType: 'Role',
        entityId: id,
        previousValues,
        newValues,
      });

      return after;
    } catch (error) {
      throw this.translateError(error, dto.nameEn);
    }
  }

  async grantPermission(roleId: string, dto: GrantRolePermissionDto, actorUserId?: string) {
    await this.assertEditable(roleId);
    const permission = await this.prisma.permission.findUnique({ where: { id: dto.permissionId } });
    if (!permission) throw new NotFoundException(`Permission ${dto.permissionId} not found.`);

    const grant = await this.prisma.$transaction(async (tx) => {
      const created = await tx.rolePermission.create({
        data: {
          id: generateId(),
          tenantId: requireTenantId(),
          roleId,
          permissionId: dto.permissionId,
          effect: dto.effect,
        },
      });

      await this.domainEvents.publish(tx, {
        eventType: 'RolePermissionGranted',
        eventVersion: 1,
        aggregateType: 'Role',
        aggregateId: roleId,
        payload: { permissionCode: permission.permissionCode, effect: dto.effect },
      });

      return created;
    });

    await this.audit.record({
      actorUserId,
      actorType: actorUserId ? 'user' : 'system',
      actionCode: 'role.permission.grant',
      domainCode: 'identity',
      entityType: 'Role',
      entityId: roleId,
      newValues: { permissionCode: permission.permissionCode, effect: dto.effect },
    });

    return grant;
  }

  async revokePermission(roleId: string, rolePermissionId: string, actorUserId?: string) {
    await this.assertEditable(roleId);
    const grant = await this.prisma.rolePermission.findUnique({
      where: { id: rolePermissionId },
      include: { permission: true },
    });
    if (!grant || grant.roleId !== roleId) {
      throw new NotFoundException(`Role permission grant ${rolePermissionId} not found.`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.update({ where: { id: rolePermissionId }, data: { effectiveTo: new Date() } });

      await this.domainEvents.publish(tx, {
        eventType: 'RolePermissionRevoked',
        eventVersion: 1,
        aggregateType: 'Role',
        aggregateId: roleId,
        payload: { permissionCode: grant.permission.permissionCode },
      });
    });

    await this.audit.record({
      actorUserId,
      actorType: actorUserId ? 'user' : 'system',
      actionCode: 'role.permission.revoke',
      domainCode: 'identity',
      entityType: 'Role',
      entityId: roleId,
      previousValues: { permissionCode: grant.permission.permissionCode },
    });
  }

  /** System roles are seeded and read-only through the API (§6). */
  private async assertEditable(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found.`);
    if (role.isSystemRole) throw new ConflictException('System roles cannot be edited through the API.');
    return role;
  }

  private translateError(error: unknown, context?: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(`Role already exists${context ? ` (${context})` : ''}.`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}
