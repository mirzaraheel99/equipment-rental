import { BadRequestException, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { PrismaService } from '../prisma/prisma.service.js';

import { runWithTenant } from './tenant-context.js';

const TENANT_ID_HEADER = 'x-tenant-id';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves tenant scope from an `x-tenant-id` header and binds it for the
 * request. This is a deliberate interim mechanism: Phase 03 (Authentication,
 * RBAC, and Governance) replaces it with tenant scope derived from the
 * authenticated session, never a client-supplied header — per the database
 * dictionary's "the frontend must never be trusted to supply authoritative
 * tenant scope" rule (docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md
 * §4.2). Tracked in docs/00-Foundation/OPEN-QUESTIONS-REGISTER.md.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const tenantId = req.header(TENANT_ID_HEADER);

    if (!tenantId || !UUID_PATTERN.test(tenantId)) {
      throw new BadRequestException(`A valid ${TENANT_ID_HEADER} header is required.`);
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, status: true },
    });

    if (!tenant) {
      throw new BadRequestException('Unknown tenant.');
    }
    if (tenant.status !== 'active') {
      throw new BadRequestException(`Tenant is not active (status: ${tenant.status}).`);
    }

    runWithTenant({ tenantId: tenant.id }, () => next());
  }
}
