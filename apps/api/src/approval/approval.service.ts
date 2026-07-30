import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { ActOnApprovalDto, CreateApprovalRequestDto, DelegateApprovalDto } from './dto/approval.dto.js';

/**
 * Generic, reusable multi-step approval engine (§8) — not yet wired to any
 * specific business workflow, since no domain that requires approvals
 * (e.g. contract amendments) exists as of this phase. Built now per the
 * roadmap's explicit Phase 03 scope so later domains only need to call it.
 */
@Injectable()
export class ApprovalService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async request(dto: CreateApprovalRequestDto, requestedBy: string) {
    const id = generateId();

    const approvalRequest = await this.prisma.$transaction(async (tx) => {
      const created = await tx.approvalRequest.create({
        data: {
          id,
          tenantId: requireTenantId(),
          domainCode: dto.domainCode,
          entityType: dto.entityType,
          entityId: dto.entityId,
          approvalType: dto.approvalType,
          status: 'pending',
          requestedBy,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
          contextSnapshotJson: dto.contextSnapshotJson ?? Prisma.DbNull,
        },
      });

      await this.domainEvents.publish(tx, {
        eventType: 'ApprovalRequested',
        eventVersion: 1,
        aggregateType: 'ApprovalRequest',
        aggregateId: created.id,
        payload: { domainCode: dto.domainCode, entityType: dto.entityType, entityId: dto.entityId },
      });

      return created;
    });

    await this.audit.record({
      actorUserId: requestedBy,
      actorType: 'user',
      actionCode: 'approval.request',
      domainCode: dto.domainCode,
      entityType: 'ApprovalRequest',
      entityId: approvalRequest.id,
      newValues: approvalRequest,
    });

    return approvalRequest;
  }

  async findOne(id: string) {
    const approvalRequest = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: { actions: { orderBy: { actedAt: 'asc' } } },
    });
    if (!approvalRequest) throw new NotFoundException(`Approval request ${id} not found.`);
    return approvalRequest;
  }

  async findAll(page: number, pageSize: number, status?: string) {
    const where = status ? { status } : {};
    const [items, totalItems] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        orderBy: { requestedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async act(id: string, approverUserId: string, dto: ActOnApprovalDto) {
    const approvalRequest = await this.findOne(id);
    if (approvalRequest.status !== 'pending') {
      throw new BadRequestException(`Approval request ${id} is not pending (status: ${approvalRequest.status}).`);
    }

    const nextStatus =
      dto.decision === 'rejected' ? 'rejected' : dto.isFinalStep ? 'approved' : approvalRequest.status;

    const result = await this.prisma.$transaction(async (tx) => {
      const action = await tx.approvalAction.create({
        data: {
          id: generateId(),
          tenantId: requireTenantId(),
          approvalRequestId: id,
          stepNumber: approvalRequest.currentStep,
          approverUserId,
          decision: dto.decision,
          comments: dto.comments ?? null,
        },
      });

      const advanceStep = dto.decision === 'approved' && !dto.isFinalStep;
      const updated = await tx.approvalRequest.update({
        where: { id },
        data: advanceStep ? { status: nextStatus, currentStep: { increment: 1 } } : { status: nextStatus },
      });

      await this.domainEvents.publish(tx, {
        eventType: 'ApprovalDecided',
        eventVersion: 1,
        aggregateType: 'ApprovalRequest',
        aggregateId: id,
        payload: { decision: dto.decision, status: updated.status, stepNumber: action.stepNumber },
      });

      return { action, request: updated };
    });

    await this.audit.record({
      actorUserId: approverUserId,
      actorType: 'user',
      actionCode: `approval.${dto.decision}`,
      domainCode: approvalRequest.domainCode,
      entityType: 'ApprovalRequest',
      entityId: id,
      newValues: result.action,
      reason: dto.comments,
    });

    return result.request;
  }

  async delegate(id: string, fromUserId: string, dto: DelegateApprovalDto) {
    const approvalRequest = await this.findOne(id);
    if (approvalRequest.status !== 'pending') {
      throw new BadRequestException(`Approval request ${id} is not pending (status: ${approvalRequest.status}).`);
    }

    const toUser = await this.prisma.userAccount.findUnique({ where: { id: dto.toUserId } });
    if (!toUser) throw new NotFoundException(`User ${dto.toUserId} not found.`);

    const action = await this.prisma.$transaction(async (tx) => {
      const created = await tx.approvalAction.create({
        data: {
          id: generateId(),
          tenantId: requireTenantId(),
          approvalRequestId: id,
          stepNumber: approvalRequest.currentStep,
          approverUserId: dto.toUserId,
          decision: 'delegated',
          comments: dto.comments ?? null,
          delegatedFromUserId: fromUserId,
        },
      });

      await this.domainEvents.publish(tx, {
        eventType: 'ApprovalDelegated',
        eventVersion: 1,
        aggregateType: 'ApprovalRequest',
        aggregateId: id,
        payload: { fromUserId, toUserId: dto.toUserId },
      });

      return created;
    });

    await this.audit.record({
      actorUserId: fromUserId,
      actorType: 'user',
      actionCode: 'approval.delegate',
      domainCode: approvalRequest.domainCode,
      entityType: 'ApprovalRequest',
      entityId: id,
      newValues: action,
      reason: dto.comments,
    });

    return action;
  }

  /**
   * Marks overdue pending requests expired. Requires a bound tenant context
   * (runs per-tenant, like every other tenant-scoped operation) — a
   * recurring caller needs the same worker-side Prisma wiring the Phase 02
   * outbox publisher still needs, which has not been built yet.
   */
  async expireOverdue(): Promise<number> {
    const now = new Date();
    const overdue = await this.prisma.approvalRequest.findMany({
      where: { status: 'pending', expiresAt: { lt: now } },
      select: { id: true, domainCode: true },
    });

    for (const request of overdue) {
      await this.prisma.$transaction(async (tx) => {
        await tx.approvalRequest.update({ where: { id: request.id }, data: { status: 'expired' } });
        await this.domainEvents.publish(tx, {
          eventType: 'ApprovalExpired',
          eventVersion: 1,
          aggregateType: 'ApprovalRequest',
          aggregateId: request.id,
          payload: {},
        });
      });

      await this.audit.record({
        actorUserId: undefined,
        actorType: 'system',
        actionCode: 'approval.expire',
        domainCode: request.domainCode,
        entityType: 'ApprovalRequest',
        entityId: request.id,
      });
    }

    return overdue.length;
  }
}
