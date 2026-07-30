import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

/**
 * Read-only — the Permission registry is seeded (§6, §11), never created
 * through the API.
 */
@ApiTags('permissions')
@Controller('permissions')
@UseGuards(PermissionsGuard)
export class PermissionController {
  constructor(@Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient) {}

  @Get()
  @RequirePermission('identity.role.manage')
  findAll() {
    return this.prisma.permission.findMany({ orderBy: { permissionCode: 'asc' } });
  }
}
