import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../generated/prisma/client.js';
import { getEnv } from '../config/configuration.js';

/** Wraps PrismaClient in Nest's lifecycle so connections open on module
 * init and close cleanly on shutdown — required for the graceful-shutdown
 * behavior Bootstrap mandates (doc 25 §15.1). Prisma 7 requires an explicit
 * driver adapter rather than reading the connection URL from schema.prisma
 * at runtime. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: getEnv().DATABASE_URL }) });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
