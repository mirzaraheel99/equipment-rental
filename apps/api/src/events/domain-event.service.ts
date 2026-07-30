import { getCorrelationId } from '@erms/observability';
import { Inject, Injectable } from '@nestjs/common';

import { generateId } from '../common/id.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import {
  TENANT_SCOPED_PRISMA,
  type TenantScopedPrismaClient,
  type TenantScopedTransactionClient,
} from '../tenant/tenant-scoped-prisma.token.js';

export interface PublishDomainEventInput {
  eventType: string;
  eventVersion: number;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  causationId?: string;
}

/**
 * Writes the domain event and its outbox row in the same transaction as
 * the domain change that raised it — the transactional-outbox pattern the
 * roadmap's Phase 02 "Events" scope requires (docs/09-Implementation/
 * 24-CODEX-IMPLEMENTATION-ROADMAP.md §7). Callers pass the transaction
 * client they're already inside, e.g.:
 *
 *   await prisma.$transaction(async (tx) => {
 *     const entity = await tx.legalEntity.create({ ... });
 *     await domainEvents.publish(tx, { eventType: 'LegalEntityCreated', ... });
 *     return entity;
 *   });
 *
 * The worker's outbox publisher (apps/worker) reads pending outbox_message
 * rows independently — this service never publishes synchronously.
 */
@Injectable()
export class DomainEventService {
  constructor(@Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient) {}

  async publish(tx: TenantScopedTransactionClient, input: PublishDomainEventInput): Promise<string> {
    const tenantId = requireTenantId();
    const eventId = generateId();

    await tx.domainEvent.create({
      data: {
        id: eventId,
        tenantId,
        eventType: input.eventType,
        eventVersion: input.eventVersion,
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        payloadJson: input.payload,
        correlationId: getCorrelationId() ?? null,
        causationId: input.causationId ?? null,
        status: 'pending',
      },
    });

    await tx.outboxMessage.create({
      data: {
        id: generateId(),
        tenantId,
        eventId,
        payloadJson: input.payload,
        status: 'pending',
        attemptCount: 0,
      },
    });

    return eventId;
  }

  /** Convenience wrapper for callers with no other transactional work. */
  async publishStandalone(input: PublishDomainEventInput): Promise<string> {
    return this.prisma.$transaction((tx) => this.publish(tx, input));
  }
}
