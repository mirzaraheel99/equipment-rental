import type { PrismaClient } from '../../generated/prisma/client.js';

import { requireTenantId } from './tenant-context.js';

/**
 * Every model below carries `tenant_id` per the database dictionary's
 * mandatory-tenant-scope rule (docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md
 * §4.1). `Tenant` itself is intentionally excluded — it has no tenant_id,
 * it *is* the tenant. `Permission` is also excluded — per §7.3 it is a
 * fixed, cross-tenant registry with no tenant_id column (docs/04-Domain/
 * 03-AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md §6).
 */
const TENANT_SCOPED_MODELS = new Set([
  'TenantSetting',
  'LegalEntity',
  'Branch',
  'Department',
  'AuditEvent',
  'DomainEvent',
  'OutboxMessage',
  'BackgroundJobExecution',
  'Document',
  'DocumentVersion',
  'DocumentAccessLog',
  'Notification',
  'UserAccount',
  'Role',
  'RolePermission',
  'UserRoleAssignment',
  'ApprovalRequest',
  'ApprovalAction',
  'AssetCategory',
  'Manufacturer',
  'EquipmentModel',
  'Asset',
  'AssetStatusHistory',
  'AssetLocation',
  'AssetLocationHistory',
  'AssetMeter',
  'AssetMeterReading',
  'AssetDocument',
]);

const WHERE_SCOPED_OPERATIONS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
  'groupBy',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
]);

function assertNotCrossTenant(model: string, providedTenantId: unknown, tenantId: string): void {
  if (providedTenantId !== undefined && providedTenantId !== tenantId) {
    throw new Error(`Cross-tenant write blocked for ${model}: tenantId does not match request scope.`);
  }
}

/**
 * Applies tenant scoping to a PrismaClient (or an already-extended one,
 * e.g. a `$transaction` callback's `tx`), making cross-tenant access
 * structurally hard rather than merely conventional: every scoped model's
 * query is rewritten to filter/inject `tenant_id` from the request's bound
 * tenant context (see tenant-context.ts), never from caller-supplied
 * input. Models not in TENANT_SCOPED_MODELS pass through untouched.
 *
 * This is application-layer defense; row-level security (RLS) remains an
 * open decision for defense-in-depth (docs/00-Foundation/OPEN-QUESTIONS-REGISTER.md B12).
 */
export function applyTenantScope<TClient extends PrismaClient>(client: TClient) {
  return client.$extends({
    name: 'tenant-scope',
    query: {
      $allModels: {
        // Prisma's extension API is necessarily loosely typed across all
        // models/operations — the unsafe casts below are contained to this
        // one file rather than leaking into callers, which get a fully
        // typed client back. See apps/api/eslint.config.mjs for the
        // matching rule scope-off.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $allOperations({ model, operation, args, query }: any) {
          if (!TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          const tenantId = requireTenantId();

          if (operation === 'create') {
            assertNotCrossTenant(model, args.data?.tenantId, tenantId);
            args.data = { ...args.data, tenantId };
            return query(args);
          }

          if (operation === 'createMany') {
            const items = Array.isArray(args.data) ? args.data : [args.data];
            args.data = items.map((item: Record<string, unknown>) => {
              assertNotCrossTenant(model, item.tenantId, tenantId);
              return { ...item, tenantId };
            });
            return query(args);
          }

          if (operation === 'upsert') {
            assertNotCrossTenant(model, args.create?.tenantId, tenantId);
            args.create = { ...args.create, tenantId };
            args.where = { ...args.where, tenantId };
            return query(args);
          }

          if (WHERE_SCOPED_OPERATIONS.has(operation)) {
            args.where = { ...args.where, tenantId };
            return query(args);
          }

          return query(args);
        },
      },
    },
  });
}
