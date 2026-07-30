import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const USER_ACCOUNT_STATUSES = ['pending', 'active', 'suspended', 'deprovisioned'] as const;
export type UserAccountStatus = (typeof USER_ACCOUNT_STATUSES)[number];

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(200)
  displayName!: string;

  @IsString()
  @MaxLength(10)
  preferredLanguage!: string;

  @IsString()
  @MaxLength(100)
  timezone!: string;

  @IsOptional()
  @IsUUID()
  primaryBranchId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  managerUserId?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  primaryBranchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  managerUserId?: string;

  @ApiPropertyOptional({ enum: USER_ACCOUNT_STATUSES })
  @IsOptional()
  @IsIn(USER_ACCOUNT_STATUSES)
  status?: UserAccountStatus;
}
