import { MiddlewareConsumer, Module, RequestMethod, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { ApprovalModule } from '../approval/approval.module.js';
import { AssetModule } from '../asset/asset.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { AuthMiddleware } from '../auth/auth.middleware.js';
import { AuthModule } from '../auth/auth.module.js';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter.js';
import { ResponseEnvelopeInterceptor } from '../common/interceptors/response-envelope.interceptor.js';
import { CorrelationIdMiddleware } from '../common/middleware/correlation-id.middleware.js';
import { AppConfigModule } from '../config/config.module.js';
import { EventsModule } from '../events/events.module.js';
import { HealthModule } from '../health/health.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { OrganizationModule } from '../organization/organization.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { TenantModule } from '../tenant/tenant.module.js';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    TenantModule,
    AuditModule,
    EventsModule,
    AuthModule,
    IdentityModule,
    ApprovalModule,
    OrganizationModule,
    AssetModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.ALL },
        { path: 'health/(.*)', method: RequestMethod.ALL },
        { path: 'docs', method: RequestMethod.ALL },
        { path: 'docs/(.*)', method: RequestMethod.ALL },
        { path: 'auth/session', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: 'auth/logout', method: RequestMethod.POST },
        { path: 'auth/dev/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
