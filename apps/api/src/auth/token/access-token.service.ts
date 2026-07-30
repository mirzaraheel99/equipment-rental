import type { ApiEnv } from '@erms/config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { APP_ENV } from '../../config/app-env.token.js';


/** 'erms-internal' — apps/web and back-office API clients. 'erms-portal' —
 * reserved for the not-yet-built Customer Portal (§4.2, §12), so the two
 * surfaces can never cross-authenticate once it exists. */
export type TokenAudience = 'erms-internal' | 'erms-portal';

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  audience: TokenAudience;
}

/**
 * ERMS's own access token — identity only, no embedded roles/permissions
 * (Decision Register #28). Short-lived by design so a compromised token
 * has a narrow blast radius; authorization is always re-derived from the
 * database per request (PermissionsService).
 */
@Injectable()
export class AccessTokenService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(APP_ENV) private readonly env: ApiEnv,
  ) {}

  sign(payload: AccessTokenPayload): string {
    return this.jwt.sign(payload, {
      secret: this.env.AUTH_JWT_ACCESS_SECRET,
      expiresIn: this.env.AUTH_JWT_ACCESS_TTL_SECONDS,
    });
  }

  verify(token: string): AccessTokenPayload {
    try {
      return this.jwt.verify<AccessTokenPayload>(token, { secret: this.env.AUTH_JWT_ACCESS_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }
}
