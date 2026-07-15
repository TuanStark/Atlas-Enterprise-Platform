import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class CreateLeavePolicyDto {
  @IsString()
  leaveTypeId: string;

  @IsOptional()
  @IsString()
  employmentTypeId?: string;

  @IsOptional()
  @IsNumber()
  annualDays?: number;

  @IsOptional()
  @IsNumber()
  maxConsecutiveDays?: number;

  @IsOptional()
  @IsNumber()
  carryForwardLimit?: number;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class UpdateLeavePolicyDto {
  @IsNumber()
  annualDays: number;

  @IsOptional()
  @IsNumber()
  maxConsecutiveDays?: number;

  @IsOptional()
  @IsNumber()
  carryForwardLimit?: number;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
