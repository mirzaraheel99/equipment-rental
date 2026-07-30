import { IsString, IsUUID } from 'class-validator';

/** Local dev provider only (see dev-idp.controller.ts) — never present when
 * AUTH_OIDC_PROVIDER=entra-id. */
export class DevLoginDto {
  @IsString()
  devUserId!: string;

  @IsUUID()
  tenantId!: string;
}
