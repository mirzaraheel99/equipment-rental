import type { ApiEnv } from '@erms/config';
import { UnauthorizedException } from '@nestjs/common';

import { RefreshTokenService } from './refresh-token.service.js';

function buildEnv(): ApiEnv {
  return { AUTH_REFRESH_TTL_SECONDS: 1209600 } as ApiEnv;
}

function buildRedisMock() {
  const store = new Map<string, string>();
  return {
    set: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve('OK');
    }),
    getdel: jest.fn((key: string) => {
      const value = store.get(key);
      store.delete(key);
      return Promise.resolve(value ?? null);
    }),
    del: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve(1);
    }),
  };
}

describe('RefreshTokenService', () => {
  it('issues a token that resolves back to its record on first consume', async () => {
    const redis = buildRedisMock();
    const service = new RefreshTokenService(redis as never, buildEnv());
    const record = { userId: 'user-1', tenantId: 'tenant-1', audience: 'erms-internal' as const };

    const token = await service.issue(record);
    await expect(service.consume(token)).resolves.toEqual(record);
  });

  it('rejects reuse of an already-consumed (rotated) token', async () => {
    const redis = buildRedisMock();
    const service = new RefreshTokenService(redis as never, buildEnv());
    const token = await service.issue({ userId: 'user-1', tenantId: 'tenant-1', audience: 'erms-internal' });

    await service.consume(token);

    await expect(service.consume(token)).rejects.toThrow(UnauthorizedException);
  });

  it('revoke makes a token unusable', async () => {
    const redis = buildRedisMock();
    const service = new RefreshTokenService(redis as never, buildEnv());
    const token = await service.issue({ userId: 'user-1', tenantId: 'tenant-1', audience: 'erms-internal' });

    await service.revoke(token);

    await expect(service.consume(token)).rejects.toThrow(UnauthorizedException);
  });
});
