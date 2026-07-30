import { SetMetadata } from '@nestjs/common';
import type { Request } from 'express';

import type { ResourceScope } from './permissions.service.js';

export const PERMISSION_KEY = 'erms:required_permission';
export const RESOURCE_SCOPE_KEY = 'erms:resource_scope_resolver';

export type ResourceScopeResolver = (request: Request) => ResourceScope | undefined;

/** Declares the permission code an endpoint requires — checked fresh from
 * the database by PermissionsGuard on every request. */
export const RequirePermission = (permissionCode: string) => SetMetadata(PERMISSION_KEY, permissionCode);

/** Declares how to resolve the target resource's ABAC scope from the
 * request, for endpoints that need narrower-than-tenant-wide enforcement
 * (§7). Omit for read/list endpoints, where any active grant suffices. */
export const ResourceScopeFrom = (resolver: ResourceScopeResolver) => SetMetadata(RESOURCE_SCOPE_KEY, resolver);
