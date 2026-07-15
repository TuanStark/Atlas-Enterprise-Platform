import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { SalaryComponentType } from '@prisma/client';

export class CreateSalaryComponentDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(SalaryComponentType)
  componentType?: SalaryComponentType;

  @IsOptional()
  @IsString()
  calculationType?: string;

  @IsOptional()
  @IsNumber()
  defaultAmount?: number;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;
}

export class UpdateSalaryComponentDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(SalaryComponentType)
  componentType?: SalaryComponentType;

  @IsOptional()
  @IsString()
  calculationType?: string;

  @IsOptional()
  @IsNumber()
  defaultAmount?: number;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;
}
