import { getCorrelationId } from '@erms/observability';
import { Inject, Injectable } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { generateId } from '../common/id.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

export type AuditActorType = 'user' | 'system' | 'integration';

export interface RecordAuditEventInput {
  actorUserId: string | undefined;
  actorType: AuditActorType;
  actionCode: string;
  domainCode: string;
  entityType: string;
  entityId: string;
  previousValues?: Record<string, unknown> | undefined;
  newValues?: Record<string, unknown> | undefined;
  reason?: string | undefined;
}

/**
 * The only writer of audit_event rows. Per CLAUDE.md and the roadmap's
 * execution rules, audit is foundation work — every mutating service in
 * every future domain calls this rather than reimplementing logging, and
 * audit_event rows are never updated or deleted (this service exposes no
 * such method).
 */
@Injectable()
export class AuditService {
  constructor(@Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient) {}

  async record(input: RecordAuditEventInput): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        id: generateId(),
        tenantId: requireTenantId(),
        actorUserId: input.actorUserId ?? null,
        actorType: input.actorType,
        actionCode: input.actionCode,
        domainCode: input.domainCode,
        entityType: input.entityType,
        entityId: input.entityId,
        previousValuesJson: input.previousValues ?? Prisma.DbNull,
        newValuesJson: input.newValues ?? Prisma.DbNull,
        reason: input.reason ?? null,
        correlationId: getCorrelationId() ?? null,
        sourceSystem: 'erms-api',
      },
    });
  }
}
