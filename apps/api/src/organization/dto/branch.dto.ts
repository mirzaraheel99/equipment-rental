import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const BRANCH_STATUSES = ['pending', 'active', 'suspended', 'archived'] as const;
export type BranchStatus = (typeof BRANCH_STATUSES)[number];

export const BRANCH_TYPES = [
  'rental_counter',
  'yard',
  'workshop',
  'warehouse',
  'office',
  'mixed',
] as const;
export type BranchType = (typeof BRANCH_TYPES)[number];

export class CreateBranchDto {
  @IsUUID()
  legalEntityId!: string;

  @IsString()
  @MaxLength(50)
  branchCode!: string;

  @IsString()
  @MaxLength(200)
  nameEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;

  @IsIn(BRANCH_TYPES)
  branchType!: BranchType;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  cityId?: string;

  @IsOptional()
  @IsObject()
  addressJson?: Record<string, unknown>;

  @IsString()
  @MaxLength(100)
  timezone!: string;
}

export class UpdateBranchDto {
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

  @ApiPropertyOptional({ enum: BRANCH_TYPES })
  @IsOptional()
  @IsIn(BRANCH_TYPES)
  branchType?: BranchType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  addressJson?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({ enum: BRANCH_STATUSES })
  @IsOptional()
  @IsIn(BRANCH_STATUSES)
  status?: BranchStatus;
}
