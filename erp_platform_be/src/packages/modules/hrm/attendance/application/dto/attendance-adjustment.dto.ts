import { IsString, IsOptional, IsDateString } from 'class-validator';

export class RequestAdjustmentDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsDateString()
  newCheckIn?: string;

  @IsOptional()
  @IsDateString()
  newCheckOut?: string;
}
