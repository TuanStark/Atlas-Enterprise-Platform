import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { JobApplication } from '../../domain/aggregates/job-application.aggregate';
import { Interview } from '../../domain/entities/interview.entity';
import { JobOffer } from '../../domain/entities/job-offer.entity';
import { HiringRecord } from '../../domain/entities/hiring-record.entity';
import * as repo from '../../domain/repositories/job-application.repository';
import {
  CreateJobApplicationDto,
  UpdateApplicationStatusDto,
  UpdateApplicationStageDto,
  ScheduleInterviewDto,
  CreateJobOfferDto,
  UpdateJobOfferStatusDto,
  HireCandidateDto,
} from '../dto/job-application.dto';
import { ApplicationStatus, OfferStatus } from '@prisma/client';

// --- Commands ---

export class CreateJobApplicationCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateJobApplicationDto,
  ) {}
}

export class UpdateApplicationStatusCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateApplicationStatusDto,
  ) {}
}

export class UpdateApplicationStageCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateApplicationStageDto,
  ) {}
}

export class ScheduleInterviewCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: ScheduleInterviewDto,
  ) {}
}

export class CreateJobOfferCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: CreateJobOfferDto,
  ) {}
}

export class UpdateJobOfferStatusCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly applicationId: Identifier,
    public readonly offerId: Identifier,
    public readonly dto: UpdateJobOfferStatusDto,
  ) {}
}

export class HireCandidateCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: HireCandidateDto,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateJobApplicationCommand)
export class CreateJobApplicationHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateJobApplicationCommand>
{
  constructor(
    @Inject(repo.JOB_APPLICATION_REPOSITORY)
    private readonly repository: repo.JobApplicationRepository,
  ) {
    super();
  }

  async execute(command: CreateJobApplicationCommand): Promise<Identifier> {
    const entity = JobApplication.create({
      tenantId: command.tenantId,
      candidateId: Identifier.create(command.dto.candidateId),
      jobPostingId: Identifier.create(command.dto.jobPostingId),
      status: command.dto.status,
      currentStage: command.dto.currentStage,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateApplicationStatusCommand)
export class UpdateApplicationStatusHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateApplicationStatusCommand>
{
  constructor(
    @Inject(repo.JOB_APPLICATION_REPOSITORY)
    private readonly repository: repo.JobApplicationRepository,
  ) {
    super();
  }

  async execute(command: UpdateApplicationStatusCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobApplication',
      command.id.toString(),
    );

    entity.updateStatus(command.dto.status);
    await this.repository.update(entity);
  }
}

@CommandHandler(UpdateApplicationStageCommand)
export class UpdateApplicationStageHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateApplicationStageCommand>
{
  constructor(
    @Inject(repo.JOB_APPLICATION_REPOSITORY)
    private readonly repository: repo.JobApplicationRepository,
  ) {
    super();
  }

  async execute(command: UpdateApplicationStageCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobApplication',
      command.id.toString(),
    );

    entity.updateStage(command.dto.stage);
    await this.repository.update(entity);
  }
}

@CommandHandler(ScheduleInterviewCommand)
export class ScheduleInterviewHandler
  extends BaseCommandHandler
  implements ICommandHandler<ScheduleInterviewCommand>
{
  constructor(
    @Inject(repo.JOB_APPLICATION_REPOSITORY)
    private readonly repository: repo.JobApplicationRepository,
  ) {
    super();
  }

  async execute(command: ScheduleInterviewCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobApplication',
      command.id.toString(),
    );

    const interview = Interview.create({
      applicationId: entity.id,
      interviewerEmploymentId: command.dto.interviewerEmploymentId
        ? Identifier.create(command.dto.interviewerEmploymentId)
        : undefined,
      scheduledAt: command.dto.scheduledAt ? new Date(command.dto.scheduledAt) : undefined,
      location: command.dto.location,
      meetingUrl: command.dto.meetingUrl,
      status: command.dto.status,
    });

    entity.addInterview(interview);
    entity.updateStatus(ApplicationStatus.interviewing);
    await this.repository.update(entity);
  }
}

@CommandHandler(CreateJobOfferCommand)
export class CreateJobOfferHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateJobOfferCommand>
{
  constructor(
    @Inject(repo.JOB_APPLICATION_REPOSITORY)
    private readonly repository: repo.JobApplicationRepository,
  ) {
    super();
  }

  async execute(command: CreateJobOfferCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobApplication',
      command.id.toString(),
    );

    const offer = JobOffer.create({
      applicationId: entity.id,
      offeredSalary: command.dto.offeredSalary,
      currency: command.dto.currency,
      startDate: command.dto.startDate ? new Date(command.dto.startDate) : undefined,
      offerFileId: command.dto.offerFileId ? Identifier.create(command.dto.offerFileId) : undefined,
    });

    entity.addJobOffer(offer);
    entity.updateStatus(ApplicationStatus.offered);
    await this.repository.update(entity);
  }
}

@CommandHandler(UpdateJobOfferStatusCommand)
export class UpdateJobOfferStatusHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateJobOfferStatusCommand>
{
  constructor(
    @Inject(repo.JOB_APPLICATION_REPOSITORY)
    private readonly repository: repo.JobApplicationRepository,
  ) {
    super();
  }

  async execute(command: UpdateJobOfferStatusCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.applicationId),
      'JobApplication',
      command.applicationId.toString(),
    );

    const offer = entity.jobOffers.find((jo) => jo.id.equals(command.offerId));
    if (!offer) {
      throw new Error(`JobOffer not found with ID ${command.offerId.toString()}`);
    }

    offer.update({ status: command.dto.status });

    if (command.dto.status === OfferStatus.accepted) {
      entity.updateStatus(ApplicationStatus.hired);
    } else if (command.dto.status === OfferStatus.declined) {
      entity.updateStatus(ApplicationStatus.withdrawn);
    }

    await this.repository.update(entity);
  }
}

@CommandHandler(HireCandidateCommand)
export class HireCandidateHandler
  extends BaseCommandHandler
  implements ICommandHandler<HireCandidateCommand>
{
  constructor(
    @Inject(repo.JOB_APPLICATION_REPOSITORY)
    private readonly repository: repo.JobApplicationRepository,
  ) {
    super();
  }

  async execute(command: HireCandidateCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobApplication',
      command.id.toString(),
    );

    const record = HiringRecord.create({
      applicationId: entity.id,
      employeeId: command.dto.employeeId ? Identifier.create(command.dto.employeeId) : undefined,
      employmentId: command.dto.employmentId
        ? Identifier.create(command.dto.employmentId)
        : undefined,
    });

    entity.addHiringRecord(record);
    entity.updateStatus(ApplicationStatus.hired);
    await this.repository.update(entity);
  }
}
