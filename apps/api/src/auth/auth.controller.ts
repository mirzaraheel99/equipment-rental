import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from './auth.middleware.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { ExchangeSessionDto } from './dto/exchange-session.dto.js';
import { ReauthenticateDto } from './dto/reauthenticate.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';

/**
 * Public session-lifecycle endpoints. `session`, `refresh`, and `logout`
 * are excluded from `AuthMiddleware` (see app.module.ts) — they establish
 * or end a session rather than requiring one. `reauthenticate` is NOT
 * excluded: it requires an already-authenticated request per §5.4.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('session')
  @HttpCode(HttpStatus.OK)
  exchangeSession(@Body() dto: ExchangeSessionDto) {
    return this.auth.exchangeSession(dto.idToken, dto.tenantId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Post('reauthenticate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reauthenticate(@CurrentUser() user: AuthenticatedUser, @Body() dto: ReauthenticateDto): Promise<void> {
    await this.auth.reauthenticate(user.id, dto.idToken);
  }
}
