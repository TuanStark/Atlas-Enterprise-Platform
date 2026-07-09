import { IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateRoleDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  @Matches(/^[A-Z0-9_]+$/)
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
