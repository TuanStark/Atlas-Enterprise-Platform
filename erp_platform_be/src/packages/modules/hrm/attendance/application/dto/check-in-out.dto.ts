import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { AttendanceSource } from '@prisma/client';

export class CheckInDto {
  @IsString()
  employmentId: string;

  @IsOptional()
  @IsDateString()
  checkInAt?: string;

  @IsOptional()
  @IsEnum(AttendanceSource)
  source?: AttendanceSource;

  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class CheckOutDto {
  @IsOptional()
  @IsDateString()
  checkOutAt?: string;
}
