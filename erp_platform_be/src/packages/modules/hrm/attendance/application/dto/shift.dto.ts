import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  startTime: string; // "HH:mm" e.g., "08:00"

  @IsString()
  endTime: string; // "HH:mm" e.g., "17:00"

  @IsOptional()
  @IsNumber()
  breakMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isFlexible?: boolean;
}

export class UpdateShiftDto {
  @IsString()
  name: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsNumber()
  breakMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isFlexible?: boolean;
}
