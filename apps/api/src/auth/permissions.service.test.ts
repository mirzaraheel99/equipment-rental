import { PermissionsService } from './permissions.service.js';

function buildPrismaMock(options: {
  assignments: { roleId: string; scopeType: string; scopeId: string | null }[];
  grants: { roleId: string; effect: string }[];
  branch?: { legalEntityId: string } | null;
  department?: { legalEntityId?: string; branchId?: string } | null;
}) {
  return {
    userRoleAssignment: { findMany: jest.fn().mockResolvedValue(options.assignments) },
    rolePermission: { findMany: jest.fn().mockResolvedValue(options.grants) },
    branch: { findUnique: jest.fn().mockResolvedValue(options.branch ?? null) },
    department: { findUnique: jest.fn().mockResolvedValue(options.department ?? null) },
  };
}

describe('PermissionsService', () => {
  it('denies when the user has no active role assignment', async () => {
    const prisma = buildPrismaMock({ assignments: [], grants: [] });
    const service = new PermissionsService(prisma as never);

    await expect(service.isAuthorized('user-1', 'platform.branch.manage')).resolves.toBe(false);
  });

  it('denies when no role assignment grants the requested permission', async () => {
    const prisma = buildPrismaMock({
      assignments: [{ roleId: 'role-1', scopeType: 'tenant', scopeId: null }],
      grants: [],
    });
    const service = new PermissionsService(prisma as never);

    await expect(service.isAuthorized('user-1', 'platform.branch.manage')).resolves.toBe(false);
  });

  it('allows a tenant-wide grant regardless of resource scope', async () => {
    const prisma = buildPrismaMock({
      assignments: [{ roleId: 'role-1', scopeType: 'tenant', scopeId: null }],
      grants: [{ roleId: 'role-1', effect: 'allow' }],
    });
    const service = new PermissionsService(prisma as never);

    await expect(
      service.isAuthorized('user-1', 'platform.branch.manage', { scopeType: 'branch', scopeId: 'branch-1' }),
    ).resolves.toBe(true);
  });

  it('denies a branch-scoped grant for a different branch (cross-branch denial)', async () => {
    const prisma = buildPrismaMock({
      assignments: [{ roleId: 'role-1', scopeType: 'branch', scopeId: 'branch-1' }],
      grants: [{ roleId: 'role-1', effect: 'allow' }],
    });
    const service = new PermissionsService(prisma as never);

    await expect(
      service.isAuthorized('user-1', 'platform.branch.manage', { scopeType: 'branch', scopeId: 'branch-2' }),
    ).resolves.toBe(false);
  });

  it('allows a legal-entity-scoped grant to cover a branch under that legal entity', async () => {
    const prisma = buildPrismaMock({
      assignments: [{ roleId: 'role-1', scopeType: 'legal_entity', scopeId: 'le-1' }],
      grants: [{ roleId: 'role-1', effect: 'allow' }],
      branch: { legalEntityId: 'le-1' },
    });
    const service = new PermissionsService(prisma as never);

    await expect(
      service.isAuthorized('user-1', 'platform.branch.manage', { scopeType: 'branch', scopeId: 'branch-1' }),
    ).resolves.toBe(true);
  });

  it('deny always wins over allow, even from a different role assignment', async () => {
    const prisma = buildPrismaMock({
      assignments: [
        { roleId: 'role-allow', scopeType: 'tenant', scopeId: null },
        { roleId: 'role-deny', scopeType: 'tenant', scopeId: null },
      ],
      grants: [
        { roleId: 'role-allow', effect: 'allow' },
        { roleId: 'role-deny', effect: 'deny' },
      ],
    });
    const service = new PermissionsService(prisma as never);

    await expect(service.isAuthorized('user-1', 'platform.branch.manage')).resolves.toBe(false);
  });

  it('allows any active assignment when no resource scope is requested (read/list endpoints)', async () => {
    const prisma = buildPrismaMock({
      assignments: [{ roleId: 'role-1', scopeType: 'branch', scopeId: 'branch-1' }],
      grants: [{ roleId: 'role-1', effect: 'allow' }],
    });
    const service = new PermissionsService(prisma as never);

    await expect(service.isAuthorized('user-1', 'platform.branch.manage')).resolves.toBe(true);
  });
});
