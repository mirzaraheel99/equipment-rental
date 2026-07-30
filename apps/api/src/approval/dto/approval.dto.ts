import { IsBoolean, IsDateString, IsIn, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateApprovalRequestDto {
  @IsString()
  @MaxLength(60)
  domainCode!: string;

  @IsString()
  @MaxLength(100)
  entityType!: string;

  @IsUUID()
  entityId!: string;

  @IsString()
  @MaxLength(60)
  approvalType!: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsObject()
  contextSnapshotJson?: Record<string, unknown>;
}

export const APPROVAL_DECISIONS = ['approved', 'rejected'] as const;
export type ApprovalDecision = (typeof APPROVAL_DECISIONS)[number];

export class ActOnApprovalDto {
  @IsIn(APPROVAL_DECISIONS)
  decision!: ApprovalDecision;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;

  /** Which step this decision closes out the request at is a business-
   * domain concept the generic engine doesn't define (§8, §12 — no
   * consuming workflow exists yet); the caller states it explicitly. */
  @IsOptional()
  @IsBoolean()
  isFinalStep?: boolean;
}

export class DelegateApprovalDto {
  @IsUUID()
  toUserId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}
