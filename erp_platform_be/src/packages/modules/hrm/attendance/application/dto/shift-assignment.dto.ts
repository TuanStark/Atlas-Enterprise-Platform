import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class AssignShiftDto {
  @IsString()
  shiftId: string;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
