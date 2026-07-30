import { Injectable, UnauthorizedException } from '@nestjs/common';

import { generateId } from '../common/id.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type { OidcClaims } from './oidc/oidc-provider.interface.js';

export interface CandidateTenant {
  id: string;
  tenantCode: string;
  nameEn: string;
}

/**
 * Resolves and, where needed, just-in-time provisions the `user_account`
 * row for a verified OIDC identity. Runs before tenant scope is
 * established, so it deliberately uses the raw `PrismaService` rather than
 * the tenant-scoped client — the same precedent as Phase 02's
 * `TenantMiddleware` resolving `Tenant` itself. docs/04-Domain/03-
 * AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md §5.2.
 */
@Injectable()
export class UserProvisioningService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every active tenant this email is a known, active user of — used to
   * disambiguate login when no tenant hint is supplied (§13). */
  async findCandidateTenants(email: string): Promise<CandidateTenant[]> {
    const rows = await this.prisma.userAccount.findMany({
      where: { email: email.toLowerCase(), status: 'active' },
      select: { tenant: { select: { id: true, tenantCode: true, nameEn: true, status: true } } },
    });

    const seen = new Set<string>();
    const candidates: CandidateTenant[] = [];
    for (const row of rows) {
      if (row.tenant.status === 'active' && !seen.has(row.tenant.id)) {
        seen.add(row.tenant.id);
        candidates.push({ id: row.tenant.id, tenantCode: row.tenant.tenantCode, nameEn: row.tenant.nameEn });
      }
    }
    return candidates;
  }

  async resolveOrCreate(tenantId: string, claims: OidcClaims) {
    const email = claims.email.toLowerCase();
    const existing = await this.prisma.userAccount.findFirst({
      where: { tenantId, OR: [{ externalIdentityId: claims.subject }, { email }] },
    });

    if (existing) {
      if (existing.status !== 'active' || existing.lockedAt) {
        throw new UnauthorizedException('This user account is not active.');
      }
      return this.prisma.userAccount.update({
        where: { id: existing.id },
        data: { externalIdentityId: claims.subject, lastLoginAt: new Date() },
      });
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || tenant.status !== 'active') {
      throw new UnauthorizedException('Unknown or inactive tenant.');
    }

    return this.prisma.userAccount.create({
      data: {
        id: generateId(),
        tenantId,
        externalIdentityId: claims.subject,
        email,
        displayName: claims.displayName,
        preferredLanguage: tenant.defaultLanguageCode,
        timezone: tenant.defaultTimezone,
        status: 'active',
        mfaStatus: 'not_enrolled',
        lastLoginAt: new Date(),
      },
    });
  }
}
