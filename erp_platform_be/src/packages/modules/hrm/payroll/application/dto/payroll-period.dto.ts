import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { PayrollStatus } from '@prisma/client';

export class CreatePayrollPeriodDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;
}

export class UpdatePayrollPeriodDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;
}
