import type { ApiEnv } from '@erms/config';
import { Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';

import { APP_ENV } from '../../config/app-env.token.js';
import { REDIS_CLIENT } from '../../redis/redis.module.js';

const KEY_PREFIX = 'auth:stepup:';

/**
 * Short-lived "reauthentication just happened" grants for privileged-action
 * step-up (§5.4). A permission flagged `is_privileged` requires one of
 * these to exist for the acting user in addition to the permission itself.
 */
@Injectable()
export class StepUpService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(APP_ENV) private readonly env: ApiEnv,
  ) {}

  async grant(userId: string): Promise<void> {
    await this.redis.set(KEY_PREFIX + userId, '1', 'EX', this.env.AUTH_STEP_UP_TTL_SECONDS);
  }

  async hasActiveGrant(userId: string): Promise<boolean> {
    return (await this.redis.exists(KEY_PREFIX + userId)) === 1;
  }
}
