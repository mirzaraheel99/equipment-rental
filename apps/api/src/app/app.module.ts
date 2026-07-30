import { MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter.js';
import { ResponseEnvelopeInterceptor } from '../common/interceptors/response-envelope.interceptor.js';
import { CorrelationIdMiddleware } from '../common/middleware/correlation-id.middleware.js';
import { AppConfigModule } from '../config/config.module.js';
import { HealthModule } from '../health/health.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [AppConfigModule, PrismaModule, RedisModule, HealthModule],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
