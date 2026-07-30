import { Inject, Injectable } from '@nestjs/common';

import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

export type ScopeType = 'tenant' | 'legal_entity' | 'branch' | 'department';

export interface ResourceScope {
  scopeType: Exclude<ScopeType, 'tenant'>;
  scopeId: string;
}

/**
 * Computes RBAC/ABAC authorization fresh from the database on every call —
 * never from a cached token claim (Decision Register #28) — per
 * docs/04-Domain/03-AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md
 * §6-§7. Deny always wins over allow.
 *
 * When `resourceScope` is omitted, any active grant is sufficient — used
 * for read/list endpoints, where row-level ABAC filtering is a documented
 * deferral (§12, "list-level ABAC row filtering"). Mutations pass an
 * explicit `resourceScope` so a branch-scoped role cannot act outside its
 * branch.
 */
@Injectable()
export class PermissionsService {
  constructor(@Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient) {}

  async isAuthorized(userId: string, permissionCode: string, resourceScope?: ResourceScope): Promise<boolean> {
    const now = new Date();

    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: {
        userId,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      },
      select: { roleId: true, scopeType: true, scopeId: true },
    });
    if (assignments.length === 0) {
      return false;
    }

    const roleIds = [...new Set(assignments.map((assignment) => assignment.roleId))];
    const grants = await this.prisma.rolePermission.findMany({
      where: {
        roleId: { in: roleIds },
        permission: { permissionCode },
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      },
      select: { roleId: true, effect: true },
    });
    if (grants.length === 0) {
      return false;
    }

    let allowed = false;
    for (const assignment of assignments) {
      const matchingGrants = grants.filter((grant) => grant.roleId === assignment.roleId);
      if (matchingGrants.length === 0) {
        continue;
      }
      if (!(await this.scopeCovers(assignment, resourceScope))) {
        continue;
      }
      for (const grant of matchingGrants) {
        if (grant.effect === 'deny') {
          return false;
        }
        allowed = true;
      }
    }
    return allowed;
  }

  /** Whether the role assignment's own scope covers the target resource
   * scope. See docs/04-Domain/03-... §7 for the scope-type hierarchy. */
  private async scopeCovers(
    assignment: { scopeType: string; scopeId: string | null },
    resourceScope: ResourceScope | undefined,
  ): Promise<boolean> {
    if (!resourceScope || assignment.scopeType === 'tenant') {
      return true;
    }
    if (assignment.scopeType === resourceScope.scopeType && assignment.scopeId === resourceScope.scopeId) {
      return true;
    }

    if (assignment.scopeType === 'legal_entity' && assignment.scopeId) {
      if (resourceScope.scopeType === 'branch') {
        const branch = await this.prisma.branch.findUnique({
          where: { id: resourceScope.scopeId },
          select: { legalEntityId: true },
        });
        return branch?.legalEntityId === assignment.scopeId;
      }
      if (resourceScope.scopeType === 'department') {
        const department = await this.prisma.department.findUnique({
          where: { id: resourceScope.scopeId },
          select: { legalEntityId: true },
        });
        return department?.legalEntityId === assignment.scopeId;
      }
    }

    if (assignment.scopeType === 'branch' && assignment.scopeId && resourceScope.scopeType === 'department') {
      const department = await this.prisma.department.findUnique({
        where: { id: resourceScope.scopeId },
        select: { branchId: true },
      });
      return department?.branchId === assignment.scopeId;
    }

    return false;
  }
}
