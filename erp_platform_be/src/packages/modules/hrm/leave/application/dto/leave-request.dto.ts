import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsString()
  employmentId: string;

  @IsString()
  leaveTypeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  totalDays: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
