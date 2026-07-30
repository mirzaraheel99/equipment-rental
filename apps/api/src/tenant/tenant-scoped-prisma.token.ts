import type { PrismaClient } from '../../generated/prisma/client.js';

import type { applyTenantScope } from './tenant-scoped-prisma.extension.js';

/** Injection token for the tenant-scoped Prisma client (see
 * tenant-scoped-prisma.extension.ts). Business services must inject this,
 * never the raw PrismaService, so every query they issue is structurally
 * confined to the current request's tenant. */
export const TENANT_SCOPED_PRISMA = Symbol('TENANT_SCOPED_PRISMA');

// Deriving the type from an actual `applyTenantScope` call (rather than a
// generic `ReturnType<PrismaClient['$extends']>`) is what gives callers a
// fully model-typed client instead of `unknown` — Prisma's `$extends`
// overloads only resolve precisely when TypeScript can see the specific
// extension being applied.
export type TenantScopedPrismaClient = ReturnType<typeof applyTenantScope<PrismaClient>>;

/** The type of the `tx` parameter inside `prisma.$transaction(async (tx) => ...)`
 * on a tenant-scoped client — Prisma's transaction client deliberately
 * omits `$connect`/`$disconnect`/`$on`/`$extends` (a transaction can't be
 * reconnected or re-extended mid-flight), so callers that need to pass
 * `tx` onward (e.g. DomainEventService.publish) must type against this,
 * not the full client. */
export type TenantScopedTransactionClient = Omit<
  TenantScopedPrismaClient,
  '$connect' | '$disconnect' | '$on' | '$extends'
>;
