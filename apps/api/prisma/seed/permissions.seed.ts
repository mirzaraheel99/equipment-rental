import { PrismaPg } from '@prisma/adapter-pg';
import { v7 as uuidv7 } from 'uuid';

import { PrismaClient } from '../../generated/prisma/client.js';

/**
 * Idempotently seeds the Permission Registry — docs/04-Domain/03-
 * AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md §11. Run via
 * `pnpm --filter @erms/api prisma:seed:permissions` against a live
 * database. Every new permission a later phase introduces must be added
 * here in the same change that adds it to §11, per the roadmap's registry
 * rule. Standalone script (not NestJS DI) — mirrors PrismaService's own
 * Prisma 7 adapter setup since there's no Nest app context here.
 */
const PERMISSIONS = [
  {
    permissionCode: 'platform.legal_entity.manage',
    domainCode: 'platform',
    actionCode: 'manage',
    description: 'Create and update Legal Entity records.',
    riskLevel: 'medium',
    isPrivileged: false,
  },
  {
    permissionCode: 'platform.branch.manage',
    domainCode: 'platform',
    actionCode: 'manage',
    description: 'Create and update Branch records.',
    riskLevel: 'medium',
    isPrivileged: false,
  },
  {
    permissionCode: 'platform.department.manage',
    domainCode: 'platform',
    actionCode: 'manage',
    description: 'Create and update Department records.',
    riskLevel: 'medium',
    isPrivileged: false,
  },
  {
    permissionCode: 'identity.user.manage',
    domainCode: 'identity',
    actionCode: 'manage',
    description: 'Create and update user_account records.',
    riskLevel: 'high',
    isPrivileged: false,
  },
  {
    permissionCode: 'identity.role.manage',
    domainCode: 'identity',
    actionCode: 'manage',
    description: 'Create/update roles and manage role_permission grants.',
    riskLevel: 'high',
    isPrivileged: false,
  },
  {
    permissionCode: 'identity.role_assignment.manage',
    domainCode: 'identity',
    actionCode: 'manage',
    description: 'Grant/revoke user_role_assignment rows — privilege escalation surface.',
    riskLevel: 'critical',
    isPrivileged: true,
  },
  {
    permissionCode: 'identity.approval.act',
    domainCode: 'identity',
    actionCode: 'act',
    description: 'Request, approve, reject, or delegate an approval_request.',
    riskLevel: 'medium',
    isPrivileged: false,
  },
  {
    permissionCode: 'identity.audit.view',
    domainCode: 'identity',
    actionCode: 'view',
    description: 'Reserved — no audit read API exists yet.',
    riskLevel: 'medium',
    isPrivileged: false,
  },
] as const;

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed permissions.');
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

  try {
    for (const permission of PERMISSIONS) {
      await prisma.permission.upsert({
        where: { permissionCode: permission.permissionCode },
        create: { id: uuidv7(), ...permission },
        update: {
          domainCode: permission.domainCode,
          actionCode: permission.actionCode,
          description: permission.description,
          riskLevel: permission.riskLevel,
          isPrivileged: permission.isPrivileged,
        },
      });
      // eslint-disable-next-line no-console
      console.log(`Seeded permission: ${permission.permissionCode}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
   
  console.error(error);
  process.exitCode = 1;
});
