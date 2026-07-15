import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { TrainingStatus } from '@prisma/client';

export class CreateTrainingSessionDto {
  @IsString()
  courseId: string;

  @IsOptional()
  @IsString()
  instructorEmploymentId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsEnum(TrainingStatus)
  status?: TrainingStatus;
}

export class UpdateTrainingSessionDto {
  @IsOptional()
  @IsString()
  instructorEmploymentId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsEnum(TrainingStatus)
  status?: TrainingStatus;
}
