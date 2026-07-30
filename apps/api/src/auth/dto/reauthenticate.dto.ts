import { IsString } from 'class-validator';

export class ReauthenticateDto {
  @IsString()
  idToken!: string;
}
