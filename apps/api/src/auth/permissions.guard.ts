import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { PrismaService } from '../prisma/prisma.service.js';

import type { AuthenticatedUser } from './auth.middleware.js';
import { PermissionsService } from './permissions.service.js';
import { PERMISSION_KEY, RESOURCE_SCOPE_KEY, type ResourceScopeResolver } from './require-permission.decorator.js';
import { StepUpService } from './token/step-up.service.js';

/**
 * Deny-by-default authorization guard (§2). A route with no
 * `@RequirePermission` metadata is rejected — every protected endpoint must
 * explicitly declare the permission it requires, per the roadmap's "never
 * create a new route ... without updating its registry" rule.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: PermissionsService,
    private readonly stepUp: StepUpService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionCode = this.reflector.getAllAndOverride<string | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permissionCode) {
      throw new ForbiddenException('This endpoint has no declared permission requirement.');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user: AuthenticatedUser | undefined = request.user;
    if (!user) {
      throw new ForbiddenException('No authenticated user on this request.');
    }

    const scopeResolver = this.reflector.getAllAndOverride<ResourceScopeResolver | undefined>(RESOURCE_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const resourceScope = scopeResolver?.(request);

    const authorized = await this.permissions.isAuthorized(user.id, permissionCode, resourceScope);
    if (!authorized) {
      throw new ForbiddenException(`Missing permission: ${permissionCode}`);
    }

    const permission = await this.prisma.permission.findUnique({
      where: { permissionCode },
      select: { isPrivileged: true },
    });
    if (permission?.isPrivileged && !(await this.stepUp.hasActiveGrant(user.id))) {
      throw new ForbiddenException('This action requires reauthentication (step-up) first.');
    }

    return true;
  }
}
