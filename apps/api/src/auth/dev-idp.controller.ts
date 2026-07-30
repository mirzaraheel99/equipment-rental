import type { ApiEnv } from '@erms/config';
import { Body, Controller, Get, Inject, NotFoundException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { APP_ENV } from '../config/app-env.token.js';

import { DevLoginDto } from './dto/dev-login.dto.js';
import { DEV_USERS } from './oidc/dev-users.js';
import { LocalDevProvider } from './oidc/local-dev.provider.js';

/**
 * Dev/CI-only stub OIDC issuer surface — lets a developer pick a seeded
 * user and tenant to sign into without a real Microsoft Entra ID tenant
 * (§5.1). Returns 404 whenever `AUTH_OIDC_PROVIDER=entra-id`, so it is
 * inert wherever real federation is configured.
 */
@ApiTags('auth-dev')
@Controller('auth/dev')
export class DevIdpController {
  constructor(
    @Inject(APP_ENV) private readonly env: ApiEnv,
    private readonly localDevProvider: LocalDevProvider,
  ) {}

  private assertLocalDevEnabled(): void {
    if (this.env.AUTH_OIDC_PROVIDER !== 'local-dev') {
      throw new NotFoundException();
    }
  }

  @Get('users')
  listUsers() {
    this.assertLocalDevEnabled();
    return DEV_USERS.map(({ id, email, displayName }) => ({ id, email, displayName }));
  }

  @Post('login')
  async login(@Body() dto: DevLoginDto) {
    this.assertLocalDevEnabled();
    const idToken = await this.localDevProvider.issueDevIdToken(dto.devUserId, dto.tenantId);
    return { idToken };
  }
}
