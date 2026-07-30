import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const ROLE_TYPES = ['system', 'custom'] as const;
export type RoleType = (typeof ROLE_TYPES)[number];

export const ROLE_STATUSES = ['active', 'inactive'] as const;
export type RoleStatus = (typeof ROLE_STATUSES)[number];

export class CreateRoleDto {
  @IsString()
  @MaxLength(60)
  roleCode!: string;

  @IsString()
  @MaxLength(200)
  nameEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;
}

export class UpdateRoleDto {
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

  @ApiPropertyOptional({ enum: ROLE_STATUSES })
  @IsOptional()
  @IsIn(ROLE_STATUSES)
  status?: RoleStatus;
}

export const ROLE_PERMISSION_EFFECTS = ['allow', 'deny'] as const;
export type RolePermissionEffect = (typeof ROLE_PERMISSION_EFFECTS)[number];

export class GrantRolePermissionDto {
  @IsUUID()
  permissionId!: string;

  @IsIn(ROLE_PERMISSION_EFFECTS)
  effect!: RolePermissionEffect;
}
