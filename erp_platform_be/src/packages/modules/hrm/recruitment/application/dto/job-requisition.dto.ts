import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { RequisitionStatus } from '@prisma/client';

export class CreateJobRequisitionDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  jobTitleId?: string;

  @IsOptional()
  @IsNumber()
  vacancies?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RequisitionStatus)
  status?: RequisitionStatus;
}

export class UpdateJobRequisitionDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  jobTitleId?: string;

  @IsOptional()
  @IsNumber()
  vacancies?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RequisitionStatus)
  status?: RequisitionStatus;
}
