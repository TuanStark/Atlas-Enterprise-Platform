import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreatePerformanceGoalDto {
  @IsString()
  employmentId: string;

  @IsString()
  performanceCycleId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdatePerformanceGoalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateGoalProgressDto {
  @IsNumber()
  progress: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  updatedByPrincipalId?: string;
}
