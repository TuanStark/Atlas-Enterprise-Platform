import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class CreateTrainingEnrollmentDto {
  @IsString()
  employmentId: string;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsDateString()
  enrolledAt?: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}

export class UpdateTrainingEnrollmentDto {
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @IsOptional()
  @IsDateString()
  enrolledAt?: string;
}

export class RecordTrainingResultDto {
  @IsNumber()
  score: number;

  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  evaluatedByEmploymentId?: string;
}

export class IssueTrainingCertificateDto {
  @IsOptional()
  @IsString()
  certificateNo?: string;

  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  fileId?: string;
}
