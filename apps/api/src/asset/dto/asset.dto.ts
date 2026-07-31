import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNumber, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const ASSET_OWNERSHIP_TYPES = ['owned', 'leased', 'consigned'] as const;
export type AssetOwnershipType = (typeof ASSET_OWNERSHIP_TYPES)[number];

export class CreateAssetDto {
  @IsString()
  @MaxLength(50)
  assetCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @IsOptional()
  @IsUUID()
  manufacturerId?: string;

  @IsOptional()
  @IsUUID()
  equipmentModelId?: string;

  @IsUUID()
  assetCategoryId!: string;

  @IsIn(ASSET_OWNERSHIP_TYPES)
  ownershipType!: AssetOwnershipType;

  @IsUUID()
  owningLegalEntityId!: string;

  @IsUUID()
  owningBranchId!: string;

  /** An existing `AssetLocation` row — if omitted, the asset is onboarded
   * with no location yet (not yet placed). */
  @IsOptional()
  @IsUUID()
  initialLocationId?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsNumber()
  purchaseCost?: number;

  @IsOptional()
  @IsNumber()
  replacementValue?: number;

  @IsOptional()
  @IsDateString()
  warrantyStartDate?: string;

  @IsOptional()
  @IsDateString()
  warrantyEndDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  engineNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  licensePlate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  qrCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  rfidTag?: string;

  @IsOptional()
  @IsObject()
  specificationJson?: Record<string, unknown>;
}

export class UpdateAssetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  manufacturerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  equipmentModelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  warrantyStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  warrantyEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  licensePlate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  specificationJson?: Record<string, unknown>;
}
