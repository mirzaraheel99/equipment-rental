import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContext {
  tenantId: string;
}

const storage = new AsyncLocalStorage<TenantContext>();

/** Runs `fn` with the given tenant bound to AsyncLocalStorage for the
 * duration of the call — every downstream service in the same async chain
 * (including the tenant-scoped Prisma extension) reads the tenant from
 * here rather than having it threaded through every function signature. */
export function runWithTenant<T>(context: TenantContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function getTenantContext(): TenantContext | undefined {
  return storage.getStore();
}

/** Throws if called outside a tenant-scoped request — callers that need a
 * tenant to operate at all (which is almost everything past Bootstrap)
 * should use this instead of the optional getter, so a missing tenant
 * fails loudly instead of silently querying unscoped. */
export function requireTenantId(): string {
  const context = storage.getStore();
  if (!context) {
    throw new Error('No tenant context is bound to the current request.');
  }
  return context.tenantId;
}
