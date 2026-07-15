import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApplicationStatus, InterviewStatus, OfferStatus } from '@prisma/client';

export class CreateJobApplicationDto {
  @IsString()
  candidateId: string;

  @IsString()
  jobPostingId: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  currentStage?: string;
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

export class UpdateApplicationStageDto {
  @IsString()
  stage: string;
}

export class ScheduleInterviewDto {
  @IsOptional()
  @IsString()
  interviewerEmploymentId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;
}

export class CreateJobOfferDto {
  @IsOptional()
  @IsNumber()
  offeredSalary?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  offerFileId?: string;
}

export class UpdateJobOfferStatusDto {
  @IsEnum(OfferStatus)
  status: OfferStatus;
}

export class HireCandidateDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  employmentId?: string;
}
