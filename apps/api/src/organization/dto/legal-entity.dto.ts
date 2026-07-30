import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export const LEGAL_ENTITY_STATUSES = ['pending', 'active', 'suspended', 'archived'] as const;
export type LegalEntityStatus = (typeof LEGAL_ENTITY_STATUSES)[number];

export class CreateLegalEntityDto {
  @IsString()
  @MaxLength(50)
  legalEntityCode!: string;

  @IsString()
  @MaxLength(300)
  legalNameEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  legalNameAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  tradeNameEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  tradeNameAr?: string;

  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  commercialRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vatRegistrationNumber?: string;

  @IsOptional()
  @IsObject()
  nationalAddressJson?: Record<string, unknown>;

  @IsString()
  @MaxLength(10)
  invoiceLanguage!: string;

  @IsString()
  @Length(3, 3)
  baseCurrencyCode!: string;
}

export class UpdateLegalEntityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  legalNameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  legalNameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  tradeNameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  tradeNameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  nationalAddressJson?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: LEGAL_ENTITY_STATUSES })
  @IsOptional()
  @IsIn(LEGAL_ENTITY_STATUSES)
  status?: LegalEntityStatus;
}
