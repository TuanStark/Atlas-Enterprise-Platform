import { JobRequisition } from '../../domain/aggregates/job-requisition.aggregate';
import { JobPosting } from '../../domain/aggregates/job-posting.aggregate';
import { Candidate } from '../../domain/aggregates/candidate.aggregate';
import { JobApplication } from '../../domain/aggregates/job-application.aggregate';
import {
  JobRequisitionReadModel,
  JobPostingReadModel,
  CandidateReadModel,
  JobApplicationReadModel,
} from '../read-models/recruitment.read-models';

export class RecruitmentReadModelMappers {
  static toJobRequisitionReadModel(entity: JobRequisition): JobRequisitionReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      title: entity.title,
      departmentId: entity.departmentId.toString(),
      jobTitleId: entity.positionId.toString(), // map positionId to jobTitleId for read-model
      vacancies: entity.quantity, // map quantity to vacancies for read-model
      description: undefined,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toJobPostingReadModel(entity: JobPosting): JobPostingReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      requisitionId: entity.requisitionId.toString(),
      title: entity.title,
      description: entity.description,
      requirements: undefined,
      workLocationId: undefined,
      employmentTypeId: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      currency: undefined,
      publishedAt: entity.publishedAt,
      closedAt: entity.expiredAt, // map expiredAt to closedAt
      status: entity.isActive ? 'published' : 'closed', // map isActive status
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static toCandidateReadModel(entity: Candidate): CandidateReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      fullName: entity.fullName,
      email: entity.email,
      phone: entity.phone,
      source: entity.source,
      resumeFileId: entity.resumeFileId ? entity.resumeFileId.toString() : undefined,
      createdAt: entity.createdAt,
    };
  }

  static toJobApplicationReadModel(entity: JobApplication): JobApplicationReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      candidateId: entity.candidateId.toString(),
      jobPostingId: entity.jobPostingId.toString(),
      status: entity.status,
      appliedAt: entity.appliedAt,
      currentStage: entity.currentStage,
      interviews: entity.interviews.map((i) => ({
        id: i.id.toString(),
        applicationId: i.applicationId.toString(),
        interviewerEmploymentId: i.interviewerEmploymentId
          ? i.interviewerEmploymentId.toString()
          : undefined,
        scheduledAt: i.scheduledAt,
        location: i.location,
        meetingUrl: i.meetingUrl,
        result: i.result,
        status: i.status,
      })),
      jobOffers: entity.jobOffers.map((jo) => ({
        id: jo.id.toString(),
        applicationId: jo.applicationId.toString(),
        offeredSalary: jo.offeredSalary,
        currency: jo.currency,
        startDate: jo.startDate,
        status: jo.status,
        offerFileId: jo.offerFileId ? jo.offerFileId.toString() : undefined,
        createdAt: jo.createdAt,
      })),
      hiringRecords: entity.hiringRecords.map((hr) => ({
        id: hr.id.toString(),
        applicationId: hr.applicationId.toString(),
        employeeId: hr.employeeId ? hr.employeeId.toString() : undefined,
        employmentId: hr.employmentId ? hr.employmentId.toString() : undefined,
        hiredAt: hr.hiredAt,
      })),
    };
  }
}
