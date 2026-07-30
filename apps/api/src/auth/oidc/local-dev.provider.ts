import type { ApiEnv } from '@erms/config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtVerify, SignJWT } from 'jose';

import { APP_ENV } from '../../config/app-env.token.js';

import { findDevUser } from './dev-users.js';
import type { OidcClaims, OidcProvider } from './oidc-provider.interface.js';

const ISSUER = 'erms-local-dev-idp';
const AUDIENCE = 'erms-api';

/**
 * Stub OIDC issuer for local development and CI — signs and verifies its
 * own ID tokens for the fixed seeded users in dev-users.ts, so the whole
 * session-exchange path (§5.2) is exercisable without a real Microsoft
 * Entra ID tenant. Never selected when AUTH_OIDC_PROVIDER=entra-id (see
 * oidc-provider.token.ts). docs/04-Domain/03-AUTHENTICATION-AND-ACCESS-
 * GOVERNANCE-DOMAIN-SPECIFICATION.md §5.1, Decision Register #27.
 */
@Injectable()
export class LocalDevProvider implements OidcProvider {
  constructor(@Inject(APP_ENV) private readonly env: ApiEnv) {}

  private signingKey(): Uint8Array {
    const secret = this.env.AUTH_LOCAL_DEV_SIGNING_SECRET;
    if (!secret) {
      throw new Error('AUTH_LOCAL_DEV_SIGNING_SECRET is required when AUTH_OIDC_PROVIDER=local-dev.');
    }
    return new TextEncoder().encode(secret);
  }

  /** Issues a signed dev ID token for a seeded user, scoped to the given
   * tenant — the local-dev equivalent of an Entra ID redirect callback. */
  async issueDevIdToken(devUserId: string, tenantId: string): Promise<string> {
    const devUser = findDevUser(devUserId);
    if (!devUser) {
      throw new UnauthorizedException(`Unknown local dev user: ${devUserId}`);
    }

    return new SignJWT({
      email: devUser.email,
      name: devUser.displayName,
      amr: devUser.amr,
      tenant_hint: tenantId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setSubject(devUser.id)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(this.signingKey());
  }

  async verifyIdToken(idToken: string): Promise<OidcClaims> {
    const { payload } = await jwtVerify(idToken, this.signingKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    }).catch(() => {
      throw new UnauthorizedException('Invalid or expired local dev ID token.');
    });

    return {
      subject: String(payload.sub),
      email: String(payload.email),
      displayName: String(payload.name),
      amr: Array.isArray(payload.amr) ? (payload.amr as string[]) : [],
      tenantHint: typeof payload.tenant_hint === 'string' ? payload.tenant_hint : undefined,
    };
  }
}
