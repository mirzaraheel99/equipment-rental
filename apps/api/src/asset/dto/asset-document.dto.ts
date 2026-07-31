import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Links an asset to a Document/DocumentVersion that already exists in
 * Platform Core's Document foundation — this domain never handles raw
 * file upload itself (domain doc §13). Platform Core's own Document
 * upload API (presigned URLs, S3 write) remains a Phase 02 deferral, so
 * `documentVersionId` must already exist before this call; see the Open
 * Questions Register for that gap.
 */
export class LinkAssetDocumentDto {
  @IsString()
  @MaxLength(60)
  documentTypeCode!: string;

  @IsOptional()
  @IsUUID()
  documentVersionId?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export const ASSET_DOCUMENT_VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'] as const;
export type AssetDocumentVerificationStatus = (typeof ASSET_DOCUMENT_VERIFICATION_STATUSES)[number];

export class VerifyAssetDocumentDto {
  @ApiPropertyOptional({ enum: ASSET_DOCUMENT_VERIFICATION_STATUSES })
  @IsIn(ASSET_DOCUMENT_VERIFICATION_STATUSES)
  verificationStatus!: AssetDocumentVerificationStatus;
}
