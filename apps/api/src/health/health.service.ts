import { Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';

import { PrismaService } from '../prisma/prisma.service.js';
import { REDIS_CLIENT } from '../redis/redis.module.js';

export interface DependencyStatus {
  status: 'up' | 'down';
  error?: string;
}

export interface ReadinessResult {
  status: 'ok' | 'degraded';
  dependencies: {
    database: DependencyStatus;
    redis: DependencyStatus;
  };
}

const START_TIME = Date.now();

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  getLiveness(): { status: 'ok'; uptimeSeconds: number } {
    return { status: 'ok', uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000) };
  }

  async getReadiness(): Promise<ReadinessResult> {
    const [database, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    const status = database.status === 'up' && redis.status === 'up' ? 'ok' : 'degraded';
    return { status, dependencies: { database, redis } };
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up' };
    } catch (error) {
      return { status: 'down', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async checkRedis(): Promise<DependencyStatus> {
    try {
      await this.redis.ping();
      return { status: 'up' };
    } catch (error) {
      return { status: 'down', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
