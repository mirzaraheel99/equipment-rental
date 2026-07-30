import { randomBytes } from 'node:crypto';

import type { ApiEnv } from '@erms/config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Redis } from 'ioredis';

import { APP_ENV } from '../../config/app-env.token.js';
import { REDIS_CLIENT } from '../../redis/redis.module.js';

import type { TokenAudience } from './access-token.service.js';

export interface RefreshTokenRecord {
  userId: string;
  tenantId: string;
  audience: TokenAudience;
}

const KEY_PREFIX = 'auth:refresh:';

/**
 * Opaque, Redis-backed refresh tokens — never a JWT (Decision Register #29).
 * Rotated on every use: presenting a valid token deletes it and issues a
 * new one, so a stolen-but-unused-yet token is invalidated the moment the
 * legitimate client refreshes. Logout deletes the key outright.
 */
@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(APP_ENV) private readonly env: ApiEnv,
  ) {}

  async issue(record: RefreshTokenRecord): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.redis.set(KEY_PREFIX + token, JSON.stringify(record), 'EX', this.env.AUTH_REFRESH_TTL_SECONDS);
    return token;
  }

  /** Verifies and atomically consumes a refresh token, returning the record
   * it was issued for. Throws if the token is unknown, expired, or already
   * used (reuse of a rotated token — a signal worth auditing at the call site). */
  async consume(token: string): Promise<RefreshTokenRecord> {
    const raw = await this.redis.getdel(KEY_PREFIX + token);
    if (!raw) {
      throw new UnauthorizedException('Refresh token is invalid, expired, or already used.');
    }
    return JSON.parse(raw) as RefreshTokenRecord;
  }

  async revoke(token: string): Promise<void> {
    await this.redis.del(KEY_PREFIX + token);
  }
}
