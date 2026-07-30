import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const ASSIGNMENT_SCOPE_TYPES = ['tenant', 'legal_entity', 'branch', 'department'] as const;
export type AssignmentScopeType = (typeof ASSIGNMENT_SCOPE_TYPES)[number];

export class AssignRoleDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  roleId!: string;

  @IsIn(ASSIGNMENT_SCOPE_TYPES)
  scopeType!: AssignmentScopeType;

  /** Required unless scopeType is 'tenant'. */
  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  assignmentReason?: string;
}
