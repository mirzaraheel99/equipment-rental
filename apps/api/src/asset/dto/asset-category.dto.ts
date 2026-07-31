import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const ASSET_CATEGORY_RISK_LEVELS = ['low', 'medium', 'high'] as const;
export type AssetCategoryRiskLevel = (typeof ASSET_CATEGORY_RISK_LEVELS)[number];

export const ASSET_CATEGORY_STATUSES = ['active', 'inactive'] as const;
export type AssetCategoryStatus = (typeof ASSET_CATEGORY_STATUSES)[number];

export class CreateAssetCategoryDto {
  @IsOptional()
  @IsUUID()
  parentCategoryId?: string;

  @IsString()
  @MaxLength(50)
  categoryCode!: string;

  @IsString()
  @MaxLength(200)
  nameEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;

  @IsOptional()
  @IsBoolean()
  serializedRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  meterRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  telematicsSupported?: boolean;

  @IsOptional()
  @IsBoolean()
  operatorRequired?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  transportClassCode?: string;

  @IsIn(ASSET_CATEGORY_RISK_LEVELS)
  riskClassification!: AssetCategoryRiskLevel;
}

export class UpdateAssetCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  serializedRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  meterRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  telematicsSupported?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  operatorRequired?: boolean;

  @ApiPropertyOptional({ enum: ASSET_CATEGORY_RISK_LEVELS })
  @IsOptional()
  @IsIn(ASSET_CATEGORY_RISK_LEVELS)
  riskClassification?: AssetCategoryRiskLevel;

  @ApiPropertyOptional({ enum: ASSET_CATEGORY_STATUSES })
  @IsOptional()
  @IsIn(ASSET_CATEGORY_STATUSES)
  status?: AssetCategoryStatus;
}
