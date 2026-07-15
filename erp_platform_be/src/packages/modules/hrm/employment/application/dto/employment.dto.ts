import { IsString, IsOptional, IsDateString, IsEnum, IsNumber } from 'class-validator';
import { EmploymentStatus } from '@prisma/client';

export class CreateEmploymentDto {
  @IsString()
  employeeId: string;

  @IsString()
  employmentTypeId: string;

  @IsString()
  employeeCode: string;

  @IsDateString()
  hireDate: string;

  @IsOptional()
  @IsDateString()
  probationStartDate?: string;

  @IsOptional()
  @IsDateString()
  probationEndDate?: string;
}

export class UpdateEmploymentStatusDto {
  @IsEnum(EmploymentStatus)
  status: EmploymentStatus;

  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class TerminateEmploymentDto {
  @IsDateString()
  terminationDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateEmploymentContractDto {
  @IsString()
  contractTypeId: string;

  @IsString()
  contractNumber: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  signedDate?: string;

  @IsOptional()
  @IsString()
  fileId?: string;
}
