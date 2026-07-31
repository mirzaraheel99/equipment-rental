import { IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export const ASSET_LOCATION_TYPES = ['branch', 'yard', 'jobsite', 'in_transit', 'with_customer'] as const;
export type AssetLocationType = (typeof ASSET_LOCATION_TYPES)[number];

export class CreateAssetLocationDto {
  @IsIn(ASSET_LOCATION_TYPES)
  locationType!: AssetLocationType;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  yardId?: string;

  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  bayCode?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  jobsiteId?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsObject()
  addressJson?: Record<string, unknown>;
}

export const ASSET_MOVEMENT_TYPES = ['transfer', 'delivery', 'pickup', 'return', 'initial'] as const;
export type AssetMovementType = (typeof ASSET_MOVEMENT_TYPES)[number];

export const ASSET_LOCATION_VERIFIED_METHODS = ['manual', 'gps', 'scan'] as const;
export type AssetLocationVerifiedMethod = (typeof ASSET_LOCATION_VERIFIED_METHODS)[number];

export class TransferAssetLocationDto {
  @IsUUID()
  toLocationId!: string;

  @IsIn(ASSET_MOVEMENT_TYPES)
  movementType!: AssetMovementType;

  /** Same optimistic-concurrency guarantee as status transitions — location
   * is the Golden Rule's other authoritative field (domain doc §8). */
  @IsInt()
  @Min(1)
  expectedRowVersion!: number;

  @IsOptional()
  @IsUUID()
  sourceEntityId?: string;

  @IsOptional()
  @IsIn(ASSET_LOCATION_VERIFIED_METHODS)
  verifiedMethod?: AssetLocationVerifiedMethod;

  @IsOptional()
  @IsNumber()
  gpsAccuracyMeters?: number;
}
