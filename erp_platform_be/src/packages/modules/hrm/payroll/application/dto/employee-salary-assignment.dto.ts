import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateEmployeeSalaryAssignmentDto {
  @IsString()
  employmentId: string;

  @IsString()
  salaryStructureId: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateEmployeeSalaryAssignmentDto {
  @IsOptional()
  @IsString()
  employmentId?: string;

  @IsOptional()
  @IsString()
  salaryStructureId?: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
