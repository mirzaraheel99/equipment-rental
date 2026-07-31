import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const MANUFACTURER_STATUSES = ['active', 'inactive'] as const;
export type ManufacturerStatus = (typeof MANUFACTURER_STATUSES)[number];

export class CreateManufacturerDto {
  @IsString()
  @MaxLength(50)
  manufacturerCode!: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string;
}

export class UpdateManufacturerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string;

  @ApiPropertyOptional({ enum: MANUFACTURER_STATUSES })
  @IsOptional()
  @IsIn(MANUFACTURER_STATUSES)
  status?: ManufacturerStatus;
}
