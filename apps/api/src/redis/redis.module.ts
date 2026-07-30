import { Global, Logger, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

import { getEnv } from '../config/configuration.js';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const logger = new Logger('RedisModule');
        const client = new Redis(getEnv().REDIS_URL, {
          lazyConnect: false,
          maxRetriesPerRequest: 1,
        });
        client.on('error', (error) => logger.error(error.message, error.stack));
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
