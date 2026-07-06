import { IsOptional, IsString } from 'class-validator';

export class UpdatePrincipalDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
