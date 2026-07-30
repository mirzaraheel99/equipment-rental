import type { ApiEnv } from '@erms/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenService } from './access-token.service.js';

function buildEnv(overrides: Partial<ApiEnv> = {}): ApiEnv {
  return {
    AUTH_JWT_ACCESS_SECRET: 'test_secret_at_least_32_characters_long',
    AUTH_JWT_ACCESS_TTL_SECONDS: 900,
    ...overrides,
  } as ApiEnv;
}

describe('AccessTokenService', () => {
  it('signs and verifies a round trip', () => {
    const service = new AccessTokenService(new JwtService(), buildEnv());

    const token = service.sign({ sub: 'user-1', tenantId: 'tenant-1', audience: 'erms-internal' });
    const payload = service.verify(token);

    expect(payload).toMatchObject({ sub: 'user-1', tenantId: 'tenant-1', audience: 'erms-internal' });
  });

  it('rejects an expired token', () => {
    const service = new AccessTokenService(new JwtService(), buildEnv({ AUTH_JWT_ACCESS_TTL_SECONDS: -1 }));

    const token = service.sign({ sub: 'user-1', tenantId: 'tenant-1', audience: 'erms-internal' });

    expect(() => service.verify(token)).toThrow(UnauthorizedException);
  });

  it('rejects a token signed with a different secret', () => {
    const issuer = new AccessTokenService(new JwtService(), buildEnv({ AUTH_JWT_ACCESS_SECRET: 'a'.repeat(32) }));
    const verifier = new AccessTokenService(new JwtService(), buildEnv({ AUTH_JWT_ACCESS_SECRET: 'b'.repeat(32) }));

    const token = issuer.sign({ sub: 'user-1', tenantId: 'tenant-1', audience: 'erms-internal' });

    expect(() => verifier.verify(token)).toThrow(UnauthorizedException);
  });
});
