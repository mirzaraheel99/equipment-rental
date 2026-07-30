import 'reflect-metadata';

import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionsGuard } from './permissions.guard.js';
import { PERMISSION_KEY } from './require-permission.decorator.js';

function buildContext(request: unknown, metadata: Record<string, unknown> = {}): ExecutionContext {
  const handler = () => undefined;
  Object.entries(metadata).forEach(([key, value]) => Reflect.defineMetadata(key, value, handler));

  return {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  it('denies by default when no @RequirePermission metadata is present', async () => {
    const guard = new PermissionsGuard(
      new Reflector(),
      { isAuthorized: jest.fn() } as never,
      { hasActiveGrant: jest.fn() } as never,
      { permission: { findUnique: jest.fn() } } as never,
    );

    await expect(guard.canActivate(buildContext({ user: { id: 'user-1' } }))).rejects.toThrow(ForbiddenException);
  });

  it('denies when there is no authenticated user on the request', async () => {
    const guard = new PermissionsGuard(
      new Reflector(),
      { isAuthorized: jest.fn() } as never,
      { hasActiveGrant: jest.fn() } as never,
      { permission: { findUnique: jest.fn() } } as never,
    );

    await expect(
      guard.canActivate(buildContext({}, { [PERMISSION_KEY]: 'platform.branch.manage' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('denies when PermissionsService reports the user is not authorized', async () => {
    const guard = new PermissionsGuard(
      new Reflector(),
      { isAuthorized: jest.fn().mockResolvedValue(false) } as never,
      { hasActiveGrant: jest.fn() } as never,
      { permission: { findUnique: jest.fn() } } as never,
    );

    await expect(
      guard.canActivate(
        buildContext({ user: { id: 'user-1' } }, { [PERMISSION_KEY]: 'platform.branch.manage' }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows when authorized and the permission is not privileged', async () => {
    const guard = new PermissionsGuard(
      new Reflector(),
      { isAuthorized: jest.fn().mockResolvedValue(true) } as never,
      { hasActiveGrant: jest.fn() } as never,
      { permission: { findUnique: jest.fn().mockResolvedValue({ isPrivileged: false }) } } as never,
    );

    await expect(
      guard.canActivate(
        buildContext({ user: { id: 'user-1' } }, { [PERMISSION_KEY]: 'platform.branch.manage' }),
      ),
    ).resolves.toBe(true);
  });

  it('denies a privileged permission without a step-up grant (permission escalation attempt)', async () => {
    const guard = new PermissionsGuard(
      new Reflector(),
      { isAuthorized: jest.fn().mockResolvedValue(true) } as never,
      { hasActiveGrant: jest.fn().mockResolvedValue(false) } as never,
      { permission: { findUnique: jest.fn().mockResolvedValue({ isPrivileged: true }) } } as never,
    );

    await expect(
      guard.canActivate(
        buildContext({ user: { id: 'user-1' } }, { [PERMISSION_KEY]: 'identity.role_assignment.manage' }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows a privileged permission once a step-up grant exists', async () => {
    const guard = new PermissionsGuard(
      new Reflector(),
      { isAuthorized: jest.fn().mockResolvedValue(true) } as never,
      { hasActiveGrant: jest.fn().mockResolvedValue(true) } as never,
      { permission: { findUnique: jest.fn().mockResolvedValue({ isPrivileged: true }) } } as never,
    );

    await expect(
      guard.canActivate(
        buildContext({ user: { id: 'user-1' } }, { [PERMISSION_KEY]: 'identity.role_assignment.manage' }),
      ),
    ).resolves.toBe(true);
  });
});
