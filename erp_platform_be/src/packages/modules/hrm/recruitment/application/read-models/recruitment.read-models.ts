import { RequisitionStatus, ApplicationStatus, InterviewStatus, OfferStatus } from '@prisma/client';

export interface JobRequisitionReadModel {
  id: string;
  tenantId: string;
  code?: string;
  title?: string;
  departmentId?: string;
  jobTitleId?: string;
  vacancies?: number;
  description?: string;
  status: RequisitionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobPostingReadModel {
  id: string;
  tenantId: string;
  requisitionId: string;
  title?: string;
  description?: string;
  requirements?: string;
  workLocationId?: string;
  employmentTypeId?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  publishedAt?: Date;
  closedAt?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateReadModel {
  id: string;
  tenantId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  source?: string;
  resumeFileId?: string;
  createdAt: Date;
}

export interface InterviewReadModel {
  id: string;
  applicationId: string;
  interviewerEmploymentId?: string;
  scheduledAt?: Date;
  location?: string;
  meetingUrl?: string;
  result?: string;
  status: InterviewStatus;
}

export interface JobOfferReadModel {
  id: string;
  applicationId: string;
  offeredSalary?: number;
  currency?: string;
  startDate?: Date;
  status: OfferStatus;
  offerFileId?: string;
  createdAt: Date;
}

export interface HiringRecordReadModel {
  id: string;
  applicationId: string;
  employeeId?: string;
  employmentId?: string;
  hiredAt: Date;
}

export interface JobApplicationReadModel {
  id: string;
  tenantId: string;
  candidateId: string;
  jobPostingId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  currentStage?: string;
  interviews: InterviewReadModel[];
  jobOffers: JobOfferReadModel[];
  hiringRecords: HiringRecordReadModel[];
}
