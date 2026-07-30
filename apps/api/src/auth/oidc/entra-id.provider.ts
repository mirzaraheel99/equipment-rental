import type { ApiEnv } from '@erms/config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

import { APP_ENV } from '../../config/app-env.token.js';

import type { OidcClaims, OidcProvider } from './oidc-provider.interface.js';

/**
 * Verifies Microsoft Entra ID ID tokens against the tenant's published JWKS
 * — real, functional OIDC verification code, not a stub. It cannot be
 * exercised end-to-end in this environment because no real Entra ID tenant
 * ID / client ID is configured here (Open Questions Register B21); it only
 * needs real config values to run in production, not different code.
 * docs/04-Domain/03-AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md §5.1.
 */
@Injectable()
export class EntraIdProvider implements OidcProvider {
  private jwks: JWTVerifyGetKey | undefined;

  constructor(@Inject(APP_ENV) private readonly env: ApiEnv) {}

  private issuer(): string {
    const tenantId = this.env.AUTH_ENTRA_TENANT_ID;
    if (!tenantId) {
      throw new Error('AUTH_ENTRA_TENANT_ID is required when AUTH_OIDC_PROVIDER=entra-id.');
    }
    return `https://login.microsoftonline.com/${tenantId}/v2.0`;
  }

  private getJwks(): JWTVerifyGetKey {
    this.jwks ??= createRemoteJWKSet(new URL(`${this.issuer()}/discovery/v2.0/keys`));
    return this.jwks;
  }

  async verifyIdToken(idToken: string): Promise<OidcClaims> {
    const clientId = this.env.AUTH_ENTRA_CLIENT_ID;
    if (!clientId) {
      throw new Error('AUTH_ENTRA_CLIENT_ID is required when AUTH_OIDC_PROVIDER=entra-id.');
    }

    const { payload } = await jwtVerify(idToken, this.getJwks(), {
      issuer: this.issuer(),
      audience: clientId,
    }).catch(() => {
      throw new UnauthorizedException('Invalid or expired Entra ID token.');
    });

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new UnauthorizedException('Entra ID token is missing required claims.');
    }

    const amrClaim = payload.amr;
    return {
      subject: payload.sub,
      email: payload.email,
      displayName: typeof payload.name === 'string' ? payload.name : payload.email,
      amr: Array.isArray(amrClaim) ? (amrClaim as string[]) : [],
      tenantHint: undefined,
    };
  }
}
