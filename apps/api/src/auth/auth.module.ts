import type { ApiEnv } from '@erms/config';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuditModule } from '../audit/audit.module.js';
import { APP_ENV } from '../config/app-env.token.js';
import { EventsModule } from '../events/events.module.js';

import { AuthController } from './auth.controller.js';
import { AuthMiddleware } from './auth.middleware.js';
import { AuthService } from './auth.service.js';
import { DevIdpController } from './dev-idp.controller.js';
import { EntraIdProvider } from './oidc/entra-id.provider.js';
import { LocalDevProvider } from './oidc/local-dev.provider.js';
import { OIDC_PROVIDER } from './oidc/oidc-provider.token.js';
import { PermissionsGuard } from './permissions.guard.js';
import { PermissionsService } from './permissions.service.js';
import { AccessTokenService } from './token/access-token.service.js';
import { RefreshTokenService } from './token/refresh-token.service.js';
import { StepUpService } from './token/step-up.service.js';
import { UserProvisioningService } from './user-provisioning.service.js';

/** @Global so PermissionsGuard, StepUpService, and CurrentUser-adjacent
 * pieces are reachable from every feature module without re-importing
 * AuthModule everywhere — the same pattern TenantModule already uses. */
@Global()
@Module({
  imports: [JwtModule.register({}), AuditModule, EventsModule],
  controllers: [AuthController, DevIdpController],
  providers: [
    LocalDevProvider,
    EntraIdProvider,
    {
      provide: OIDC_PROVIDER,
      useFactory: (env: ApiEnv, local: LocalDevProvider, entra: EntraIdProvider) =>
        env.AUTH_OIDC_PROVIDER === 'entra-id' ? entra : local,
      inject: [APP_ENV, LocalDevProvider, EntraIdProvider],
    },
    AccessTokenService,
    RefreshTokenService,
    StepUpService,
    UserProvisioningService,
    PermissionsService,
    PermissionsGuard,
    AuthService,
    AuthMiddleware,
  ],
  exports: [AccessTokenService, PermissionsService, PermissionsGuard, StepUpService, AuthMiddleware],
})
export class AuthModule {}
