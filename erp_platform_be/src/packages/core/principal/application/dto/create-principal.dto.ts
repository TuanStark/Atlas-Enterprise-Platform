import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { PrincipalType } from '../../domain';

export class CreatePrincipalDto {
  @IsUUID()
  tenantId: string;

  @IsEnum(PrincipalType)
  type: PrincipalType;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
