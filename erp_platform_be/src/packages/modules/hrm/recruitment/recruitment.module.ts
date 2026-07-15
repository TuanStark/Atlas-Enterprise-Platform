import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';

// Repositories
import { JOB_REQUISITION_REPOSITORY } from './domain/repositories/job-requisition.repository';
import { JOB_POSTING_REPOSITORY } from './domain/repositories/job-posting.repository';
import { CANDIDATE_REPOSITORY } from './domain/repositories/candidate.repository';
import { JOB_APPLICATION_REPOSITORY } from './domain/repositories/job-application.repository';

import { PrismaJobRequisitionRepository } from './infrastructure/repositories/prisma-job-requisition.repository';
import { PrismaJobPostingRepository } from './infrastructure/repositories/prisma-job-posting.repository';
import { PrismaCandidateRepository } from './infrastructure/repositories/prisma-candidate.repository';
import { PrismaJobApplicationRepository } from './infrastructure/repositories/prisma-job-application.repository';

// Controllers
import { JobRequisitionController } from './presentation/controllers/job-requisition.controller';
import { JobPostingController } from './presentation/controllers/job-posting.controller';
import { CandidateController } from './presentation/controllers/candidate.controller';
import { JobApplicationController } from './presentation/controllers/job-application.controller';

// Command Handlers
import {
  CreateJobRequisitionHandler,
  UpdateJobRequisitionHandler,
  ApproveJobRequisitionHandler,
  CloseJobRequisitionHandler,
  CancelJobRequisitionHandler,
} from './application/commands/job-requisition.commands';
import {
  CreateJobPostingHandler,
  UpdateJobPostingHandler,
  PublishJobPostingHandler,
  CloseJobPostingHandler,
} from './application/commands/job-posting.commands';
import {
  CreateCandidateHandler,
  UpdateCandidateHandler,
  DeleteCandidateHandler,
} from './application/commands/candidate.commands';
import {
  CreateJobApplicationHandler,
  UpdateApplicationStatusHandler,
  UpdateApplicationStageHandler,
  ScheduleInterviewHandler,
  CreateJobOfferHandler,
  UpdateJobOfferStatusHandler,
  HireCandidateHandler,
} from './application/commands/job-application.commands';

// Query Handlers
import {
  GetJobRequisitionHandler,
  ListJobRequisitionsHandler,
} from './application/queries/job-requisition.queries';
import {
  GetJobPostingHandler,
  ListJobPostingsHandler,
} from './application/queries/job-posting.queries';
import {
  GetCandidateHandler,
  ListCandidatesHandler,
} from './application/queries/candidate.queries';
import {
  GetJobApplicationHandler,
  ListJobApplicationsHandler,
} from './application/queries/job-application.queries';

const commandHandlers = [
  CreateJobRequisitionHandler,
  UpdateJobRequisitionHandler,
  ApproveJobRequisitionHandler,
  CloseJobRequisitionHandler,
  CancelJobRequisitionHandler,
  CreateJobPostingHandler,
  UpdateJobPostingHandler,
  PublishJobPostingHandler,
  CloseJobPostingHandler,
  CreateCandidateHandler,
  UpdateCandidateHandler,
  DeleteCandidateHandler,
  CreateJobApplicationHandler,
  UpdateApplicationStatusHandler,
  UpdateApplicationStageHandler,
  ScheduleInterviewHandler,
  CreateJobOfferHandler,
  UpdateJobOfferStatusHandler,
  HireCandidateHandler,
];

const queryHandlers = [
  GetJobRequisitionHandler,
  ListJobRequisitionsHandler,
  GetJobPostingHandler,
  ListJobPostingsHandler,
  GetCandidateHandler,
  ListCandidatesHandler,
  GetJobApplicationHandler,
  ListJobApplicationsHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [
    JobRequisitionController,
    JobPostingController,
    CandidateController,
    JobApplicationController,
  ],

  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: JOB_REQUISITION_REPOSITORY,
      useClass: PrismaJobRequisitionRepository,
    },
    {
      provide: JOB_POSTING_REPOSITORY,
      useClass: PrismaJobPostingRepository,
    },
    {
      provide: CANDIDATE_REPOSITORY,
      useClass: PrismaCandidateRepository,
    },
    {
      provide: JOB_APPLICATION_REPOSITORY,
      useClass: PrismaJobApplicationRepository,
    },
  ],

  exports: [
    JOB_REQUISITION_REPOSITORY,
    JOB_POSTING_REPOSITORY,
    CANDIDATE_REPOSITORY,
    JOB_APPLICATION_REPOSITORY,
  ],
})
export class RecruitmentModule {}
