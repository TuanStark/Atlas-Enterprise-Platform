import { IsString, IsOptional, IsNumber, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewStatus } from '@prisma/client';

export class CreatePerformanceReviewItemDto {
  @IsOptional()
  @IsString()
  goalId?: string;

  @IsOptional()
  @IsString()
  criteria?: string;

  @IsOptional()
  @IsString()
  ratingId?: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreatePerformanceReviewDto {
  @IsString()
  employmentId: string;

  @IsOptional()
  @IsString()
  reviewerEmploymentId?: string;

  @IsString()
  performanceCycleId: string;

  @IsOptional()
  @IsString()
  workflowInstanceId?: string;

  @IsOptional()
  @IsString()
  overallRatingId?: string;

  @IsOptional()
  @IsNumber()
  overallScore?: number;

  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePerformanceReviewItemDto)
  reviewItems?: CreatePerformanceReviewItemDto[];
}

export class UpdatePerformanceReviewDto {
  @IsOptional()
  @IsString()
  reviewerEmploymentId?: string;

  @IsOptional()
  @IsString()
  workflowInstanceId?: string;

  @IsOptional()
  @IsString()
  overallRatingId?: string;

  @IsOptional()
  @IsNumber()
  overallScore?: number;

  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePerformanceReviewItemDto)
  reviewItems?: CreatePerformanceReviewItemDto[];
}
