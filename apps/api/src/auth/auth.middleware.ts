import { Injectable, UnauthorizedException, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { PrismaService } from '../prisma/prisma.service.js';
import { runWithTenant } from '../tenant/tenant-context.js';

import { AccessTokenService } from './token/access-token.service.js';
import type { TokenAudience } from './token/access-token.service.js';

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  audience: TokenAudience;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- augmenting Express's own namespaced Request type is the standard pattern (@types/express does the same).
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Verifies the bearer access token, confirms the user is still active
 * (fresh DB read — a suspended/deprovisioned user is rejected on their
 * very next request, not at token expiry), attaches `req.user`, and binds
 * tenant scope from the token's `tenantId` claim. Supersedes the interim
 * `x-tenant-id` header mechanism (Decision Register #26). docs/04-Domain/
 * 03-AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md §5.3.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly accessTokens: AccessTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('A valid Authorization: Bearer <token> header is required.');
    }

    const payload = this.accessTokens.verify(header.slice('Bearer '.length));

    const user = await this.prisma.userAccount.findUnique({
      where: { id: payload.sub },
      select: { id: true, tenantId: true, status: true, lockedAt: true },
    });

    if (!user || user.tenantId !== payload.tenantId || user.status !== 'active' || user.lockedAt) {
      throw new UnauthorizedException('This session is no longer valid.');
    }

    req.user = { id: user.id, tenantId: user.tenantId, audience: payload.audience };

    runWithTenant({ tenantId: user.tenantId }, () => next());
  }
}
