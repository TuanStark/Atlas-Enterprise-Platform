import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateContractTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  durationMonth?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateContractTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  durationMonth?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
