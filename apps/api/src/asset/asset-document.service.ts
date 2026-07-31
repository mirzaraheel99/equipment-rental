import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service.js';
import { generateId } from '../common/id.js';
import { DomainEventService } from '../events/domain-event.service.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { LinkAssetDocumentDto, VerifyAssetDocumentDto } from './dto/asset-document.dto.js';

/**
 * Links an asset to a Document/DocumentVersion (domain doc §13) and tracks
 * certificate expiry/verification metadata. Expired state is always
 * computed from `expiryDate` at read time, never a manually maintained
 * flag (domain doc §10, §21 Acceptance Criterion 5).
 */
@Injectable()
export class AssetDocumentService {
  constructor(
    @Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient,
    private readonly audit: AuditService,
    private readonly domainEvents: DomainEventService,
  ) {}

  async link(assetId: string, dto: LinkAssetDocumentDto, actorUserId?: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException(`Asset ${assetId} not found.`);

    const id = generateId();
    const assetDocument = await this.prisma.$transaction(async (tx) => {
      const created = await tx.assetDocument.create({
        data: {
          id,
          tenantId: requireTenantId(),
          assetId,
          documentTypeCode: dto.documentTypeCode,
          currentDocumentVersionId: dto.documentVersionId ?? null,
          issueDate: dto.issueDate ?? null,
          expiryDate: dto.expiryDate ?? null,
          verificationStatus: 'pending',
          status: 'active',
        },
      });

      await this.domainEvents.publish(tx, {
        eventType: 'AssetCertificateUploaded',
        eventVersion: 1,
        aggregateType: 'Asset',
        aggregateId: assetId,
        payload: { documentTypeCode: dto.documentTypeCode, expiryDate: dto.expiryDate },
      });

      return created;
    });

    await this.audit.record({
      actorUserId,
      actorType: actorUserId ? 'user' : 'system',
      actionCode: 'asset.document.upload',
      domainCode: 'asset',
      entityType: 'AssetDocument',
      entityId: assetDocument.id,
      newValues: assetDocument,
    });

    return assetDocument;
  }

  async verify(assetDocumentId: string, dto: VerifyAssetDocumentDto, actorUserId: string) {
    const existing = await this.prisma.assetDocument.findUnique({ where: { id: assetDocumentId } });
    if (!existing) throw new NotFoundException(`Asset document ${assetDocumentId} not found.`);

    const updated = await this.prisma.assetDocument.update({
      where: { id: assetDocumentId },
      data: { verificationStatus: dto.verificationStatus },
    });

    await this.audit.record({
      actorUserId,
      actorType: 'user',
      actionCode: 'asset.document.verify',
      domainCode: 'asset',
      entityType: 'AssetDocument',
      entityId: assetDocumentId,
      previousValues: { verificationStatus: existing.verificationStatus },
      newValues: { verificationStatus: updated.verificationStatus },
    });

    return updated;
  }

  async findAllForAsset(assetId: string) {
    return this.prisma.assetDocument.findMany({ where: { assetId }, orderBy: { expiryDate: 'asc' } });
  }

  /** "Current valid certificates for asset X" — the query the Contract
   * domain calls at Check-Out (domain doc §10). This registry only
   * guarantees the state it returns is accurate; whether to block
   * Check-Out on the result is Contract/Rental Operations' own rule. */
  async findValidCertificates(assetId: string) {
    const now = new Date();
    return this.prisma.assetDocument.findMany({
      where: {
        assetId,
        status: 'active',
        OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
      },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
