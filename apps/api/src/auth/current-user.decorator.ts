import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedUser } from './auth.middleware.js';

/** Reads the `req.user` attached by `AuthMiddleware`. Only usable on routes
 * `AuthMiddleware` actually runs for — never on the excluded public auth
 * endpoints (see app.module.ts). */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest<Request>();
  if (!request.user) {
    throw new Error('CurrentUser() used on a route with no authenticated request.user — check AuthMiddleware wiring.');
  }
  return request.user;
});
