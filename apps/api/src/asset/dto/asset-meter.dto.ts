import { IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const ASSET_METER_TYPES = ['engine_hours', 'mileage', 'cycles'] as const;
export type AssetMeterType = (typeof ASSET_METER_TYPES)[number];

export class CreateAssetMeterDto {
  @IsIn(ASSET_METER_TYPES)
  meterType!: AssetMeterType;

  @IsString()
  @MaxLength(20)
  unitCode!: string;
}

export const ASSET_METER_READING_SOURCES = ['manual', 'telematics'] as const;
export type AssetMeterReadingSource = (typeof ASSET_METER_READING_SOURCES)[number];

export class RecordAssetMeterReadingDto {
  @IsNumber()
  readingValue!: number;

  @IsIn(ASSET_METER_READING_SOURCES)
  source!: AssetMeterReadingSource;

  @IsOptional()
  @IsUUID()
  sourceEntityId?: string;
}
