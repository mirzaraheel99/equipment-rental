import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const EQUIPMENT_MODEL_STATUSES = ['active', 'inactive'] as const;
export type EquipmentModelStatus = (typeof EQUIPMENT_MODEL_STATUSES)[number];

export class CreateEquipmentModelDto {
  @IsUUID()
  manufacturerId!: string;

  @IsUUID()
  assetCategoryId!: string;

  @IsString()
  @MaxLength(50)
  modelCode!: string;

  @IsString()
  @MaxLength(200)
  modelName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionAr?: string;

  @IsOptional()
  @IsObject()
  standardSpecificationJson?: Record<string, unknown>;
}

export class UpdateEquipmentModelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  modelName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  standardSpecificationJson?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: EQUIPMENT_MODEL_STATUSES })
  @IsOptional()
  @IsIn(EQUIPMENT_MODEL_STATUSES)
  status?: EquipmentModelStatus;
}
