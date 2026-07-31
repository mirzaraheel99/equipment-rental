import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { ASSET_STATUSES, type AssetStatus } from '../asset-status.js';

export class TransitionAssetStatusDto {
  @IsIn(ASSET_STATUSES)
  toStatus!: AssetStatus;

  /** The asset's `rowVersion` the client last read — a mismatch means
   * someone else changed the asset since, and this transition is rejected
   * rather than silently overwriting theirs (the Golden Rule's optimistic
   * concurrency guarantee, domain doc §6.2/§12). */
  @IsInt()
  @Min(1)
  expectedRowVersion!: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  reasonCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourceEntityType?: string;

  @IsOptional()
  @IsUUID()
  sourceEntityId?: string;
}
