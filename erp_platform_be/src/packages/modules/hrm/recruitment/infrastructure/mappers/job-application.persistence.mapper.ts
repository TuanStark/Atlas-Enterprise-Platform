import {
  JobApplication as PrismaJobApplication,
  Interview as PrismaInterview,
  JobOffer as PrismaJobOffer,
  HiringRecord as PrismaHiringRecord,
  ApplicationStatus,
  InterviewStatus,
  OfferStatus,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobApplication } from '../../domain/aggregates/job-application.aggregate';
import { Interview } from '../../domain/entities/interview.entity';
import { JobOffer } from '../../domain/entities/job-offer.entity';
import { HiringRecord } from '../../domain/entities/hiring-record.entity';

export type PrismaJobApplicationPayload = PrismaJobApplication & {
  applicationInterviews?: PrismaInterview[];
  applicationJobOffers?: PrismaJobOffer[];
  applicationHiringRecords?: PrismaHiringRecord[];
};

export class JobApplicationPersistenceMapper {
  static toDomain(prisma: PrismaJobApplicationPayload): JobApplication {
    const applicationId = Identifier.create(prisma.id);

    return JobApplication.rehydrate(applicationId, {
      tenantId: Identifier.create(prisma.tenantId),
      candidateId: Identifier.create(prisma.candidateId),
      jobPostingId: Identifier.create(prisma.jobPostingId),
      status: prisma.status ?? ApplicationStatus.applied,
      appliedAt: prisma.appliedAt ?? new Date(),
      currentStage: prisma.currentStage ?? undefined,
      interviews: (prisma.applicationInterviews ?? []).map((i) =>
        Interview.rehydrate(Identifier.create(i.id), {
          applicationId,
          interviewerEmploymentId: i.interviewerEmploymentId
            ? Identifier.create(i.interviewerEmploymentId)
            : undefined,
          scheduledAt: i.scheduledAt ?? undefined,
          location: i.location ?? undefined,
          meetingUrl: i.meetingUrl ?? undefined,
          result: i.result ?? undefined,
          status: i.status ?? InterviewStatus.scheduled,
        }),
      ),
      jobOffers: (prisma.applicationJobOffers ?? []).map((jo) =>
        JobOffer.rehydrate(Identifier.create(jo.id), {
          applicationId,
          offeredSalary: jo.offeredSalary ? jo.offeredSalary.toNumber() : undefined,
          currency: jo.currency ?? undefined,
          startDate: jo.startDate ?? undefined,
          status: jo.status ?? OfferStatus.draft,
          offerFileId: jo.offerFileId ? Identifier.create(jo.offerFileId) : undefined,
          createdAt: jo.createdAt ?? new Date(),
        }),
      ),
      hiringRecords: (prisma.applicationHiringRecords ?? []).map((hr) =>
        HiringRecord.rehydrate(Identifier.create(hr.id), {
          applicationId,
          employeeId: hr.employeeId ? Identifier.create(hr.employeeId) : undefined,
          employmentId: hr.employmentId ? Identifier.create(hr.employmentId) : undefined,
          hiredAt: hr.hiredAt ?? new Date(),
        }),
      ),
    });
  }

  static toPersistence(entity: JobApplication): PrismaJobApplication {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      candidateId: entity.candidateId.toString(),
      jobPostingId: entity.jobPostingId.toString(),
      status: entity.status,
      appliedAt: entity.appliedAt,
      currentStage: entity.currentStage ?? null,
    };
  }
}
