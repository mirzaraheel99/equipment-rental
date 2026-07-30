import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import { diffEntities } from '../audit/entity-diff.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateLegalEntityDto, UpdateLegalEntityDto } from './dto/legal-entity.dto.js';

@Injectable()
export class LegalEntityService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async create(dto: CreateLegalEntityDto, actorUserId?: string) {
    const id = generateId();

    try {
      const entity = await this.prisma.$transaction(async (tx) => {
        const created = await tx.legalEntity.create({
          data: {
            id,
            tenantId: requireTenantId(),
            legalEntityCode: dto.legalEntityCode,
            legalNameEn: dto.legalNameEn,
            legalNameAr: dto.legalNameAr ?? null,
            tradeNameEn: dto.tradeNameEn ?? null,
            tradeNameAr: dto.tradeNameAr ?? null,
            countryCode: dto.countryCode,
            commercialRegistrationNumber: dto.commercialRegistrationNumber ?? null,
            vatRegistrationNumber: dto.vatRegistrationNumber ?? null,
            nationalAddressJson: dto.nationalAddressJson ?? Prisma.DbNull,
            invoiceLanguage: dto.invoiceLanguage,
            baseCurrencyCode: dto.baseCurrencyCode,
            status: 'pending',
          },
        });

        await this.domainEvents.publish(tx, {
          eventType: 'LegalEntityCreated',
          eventVersion: 1,
          aggregateType: 'LegalEntity',
          aggregateId: created.id,
          payload: { legalEntityCode: created.legalEntityCode, status: created.status },
        });

        return created;
      });

      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'legal_entity.create',
        domainCode: 'platform',
        entityType: 'LegalEntity',
        entityId: entity.id,
        newValues: entity,
      });

      return entity;
    } catch (error) {
      throw this.translateError(error, dto.legalEntityCode);
    }
  }

  async findAll(page: number, pageSize: number) {
    const [items, totalItems] = await Promise.all([
      this.prisma.legalEntity.findMany({
        orderBy: { legalEntityCode: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.legalEntity.count(),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const entity = await this.prisma.legalEntity.findUnique({ where: { id } });
    if (!entity) throw new NotFoundException(`Legal entity ${id} not found.`);
    return entity;
  }

  async update(id: string, dto: UpdateLegalEntityDto, actorUserId?: string) {
    const before = await this.findOne(id);

    try {
      const after = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.legalEntity.update({
          where: { id },
          data: {
            ...dto,
            rowVersion: { increment: 1 },
          },
        });

        if (dto.status && dto.status !== before.status) {
          await this.domainEvents.publish(tx, {
            eventType: 'LegalEntityStatusChanged',
            eventVersion: 1,
            aggregateType: 'LegalEntity',
            aggregateId: updated.id,
            payload: { from: before.status, to: updated.status },
          });
        }

        return updated;
      });

      const { previousValues, newValues } = diffEntities(before, after);
      await this.audit.record({
        actorUserId,
        actorType: actorUserId ? 'user' : 'system',
        actionCode: 'legal_entity.update',
        domainCode: 'platform',
        entityType: 'LegalEntity',
        entityId: id,
        previousValues,
        newValues,
      });

      return after;
    } catch (error) {
      throw this.translateError(error, dto.legalNameEn);
    }
  }

  private translateError(error: unknown, context?: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(`Legal entity already exists${context ? ` (${context})` : ''}.`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }
}
