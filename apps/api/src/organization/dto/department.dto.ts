import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const DEPARTMENT_STATUSES = ['pending', 'active', 'suspended', 'archived'] as const;
export type DepartmentStatus = (typeof DEPARTMENT_STATUSES)[number];

export class CreateDepartmentDto {
  @IsUUID()
  legalEntityId!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  parentDepartmentId?: string;

  @IsString()
  @MaxLength(50)
  departmentCode!: string;

  @IsString()
  @MaxLength(200)
  nameEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentDepartmentId?: string;

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

  @ApiPropertyOptional({ enum: DEPARTMENT_STATUSES })
  @IsOptional()
  @IsIn(DEPARTMENT_STATUSES)
  status?: DepartmentStatus;
}
