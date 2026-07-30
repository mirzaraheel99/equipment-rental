import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ExchangeSessionDto {
  @IsString()
  idToken!: string;

  /** Disambiguates which tenant to sign into when the verified identity is
   * an active user of more than one (§13). Optional — if omitted and more
   * than one candidate exists, the API responds with the candidate list
   * instead of guessing. */
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
