import { IsString, IsOptional, IsNumber, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PayrollStatus } from '@prisma/client';

export class CreatePayrollItemDto {
  @IsString()
  salaryComponentId: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreatePayrollDto {
  @IsString()
  payrollPeriodId: string;

  @IsString()
  employmentId: string;

  @IsOptional()
  @IsNumber()
  grossSalary?: number;

  @IsOptional()
  @IsNumber()
  totalAllowance?: number;

  @IsOptional()
  @IsNumber()
  totalDeduction?: number;

  @IsOptional()
  @IsNumber()
  netSalary?: number;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @IsOptional()
  @IsString()
  payslipFileId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePayrollItemDto)
  payrollItems?: CreatePayrollItemDto[];
}

export class UpdatePayrollDto {
  @IsOptional()
  @IsNumber()
  grossSalary?: number;

  @IsOptional()
  @IsNumber()
  totalAllowance?: number;

  @IsOptional()
  @IsNumber()
  totalDeduction?: number;

  @IsOptional()
  @IsNumber()
  netSalary?: number;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @IsOptional()
  @IsString()
  payslipFileId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePayrollItemDto)
  payrollItems?: CreatePayrollItemDto[];
}
