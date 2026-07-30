import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { runWithTenant } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import { MfaRequiredException } from './exceptions/mfa-required.exception.js';
import { TenantSelectionRequiredException } from './exceptions/tenant-selection-required.exception.js';
import type { OidcClaims, OidcProvider } from './oidc/oidc-provider.interface.js';
import { OIDC_PROVIDER } from './oidc/oidc-provider.token.js';
import { AccessTokenService, type TokenAudience } from './token/access-token.service.js';
import { RefreshTokenService } from './token/refresh-token.service.js';
import { StepUpService } from './token/step-up.service.js';
import { UserProvisioningService } from './user-provisioning.service.js';

export interface SessionResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
  tenantId: string;
}

/**
 * Orchestrates the session-exchange, refresh, logout, and reauthentication
 * flows defined in docs/04-Domain/03-AUTHENTICATION-AND-ACCESS-GOVERNANCE-
 * DOMAIN-SPECIFICATION.md §5.
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(OIDC_PROVIDER) private readonly oidcProvider: OidcProvider,
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly provisioning: UserProvisioningService,
    private readonly accessTokens: AccessTokenService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly stepUp: StepUpService,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async exchangeSession(
    idToken: string,
    tenantIdHint: string | undefined,
    audience: TokenAudience = 'erms-internal',
  ): Promise<SessionResult> {
    const claims = await this.oidcProvider.verifyIdToken(idToken);
    const tenantId = await this.resolveTenantId(claims, tenantIdHint);
    const user = await this.provisioning.resolveOrCreate(tenantId, claims);

    if (user.mfaStatus === 'required' && !claims.amr.includes('mfa')) {
      throw new MfaRequiredException();
    }

    const accessToken = this.accessTokens.sign({ sub: user.id, tenantId, audience });
    const refreshToken = await this.refreshTokens.issue({ userId: user.id, tenantId, audience });

    await runWithTenant({ tenantId }, async () => {
      await this.audit.record({
        actorUserId: user.id,
        actorType: 'user',
        actionCode: 'auth.login',
        domainCode: 'identity',
        entityType: 'UserAccount',
        entityId: user.id,
      });
      await this.domainEvents.publishStandalone({
        eventType: 'UserLoggedIn',
        eventVersion: 1,
        aggregateType: 'UserAccount',
        aggregateId: user.id,
        payload: { audience },
      });
    });

    return { accessToken, refreshToken, userId: user.id, tenantId };
  }

  private async resolveTenantId(claims: OidcClaims, tenantIdHint: string | undefined): Promise<string> {
    if (tenantIdHint) {
      return tenantIdHint;
    }
    if (claims.tenantHint) {
      return claims.tenantHint;
    }

    const candidates = await this.provisioning.findCandidateTenants(claims.email);
    if (candidates.length === 1) {
      return candidates[0]!.id;
    }
    if (candidates.length === 0) {
      throw new UnauthorizedException(
        'No active tenant found for this identity. An administrator must provision this user first.',
      );
    }
    throw new TenantSelectionRequiredException(candidates);
  }

  async refresh(refreshToken: string): Promise<SessionResult> {
    const record = await this.refreshTokens.consume(refreshToken);
    const accessToken = this.accessTokens.sign({
      sub: record.userId,
      tenantId: record.tenantId,
      audience: record.audience,
    });
    const newRefreshToken = await this.refreshTokens.issue(record);
    return { accessToken, refreshToken: newRefreshToken, userId: record.userId, tenantId: record.tenantId };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokens.revoke(refreshToken);
  }

  /** Step-up for privileged actions (§5.4) — requires a fresh ID token from
   * the same identity already bound to the current access token, not just
   * any valid token. */
  async reauthenticate(currentUserId: string, idToken: string): Promise<void> {
    const claims = await this.oidcProvider.verifyIdToken(idToken);
    const user = await this.prisma.userAccount.findUnique({ where: { id: currentUserId } });

    if (!user || user.externalIdentityId !== claims.subject) {
      throw new UnauthorizedException('Reauthentication identity does not match the current session.');
    }

    await this.stepUp.grant(currentUserId);
    await this.audit.record({
      actorUserId: currentUserId,
      actorType: 'user',
      actionCode: 'auth.reauthenticate',
      domainCode: 'identity',
      entityType: 'UserAccount',
      entityId: currentUserId,
    });
  }
}
