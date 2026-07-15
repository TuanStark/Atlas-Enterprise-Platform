import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { JobPosting } from '../../domain/aggregates/job-posting.aggregate';
import * as repo from '../../domain/repositories/job-posting.repository';
import { CreateJobPostingDto, UpdateJobPostingDto } from '../dto/job-posting.dto';

// --- Commands ---

export class CreateJobPostingCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateJobPostingDto,
  ) {}
}

export class UpdateJobPostingCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateJobPostingDto,
  ) {}
}

export class PublishJobPostingCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class CloseJobPostingCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateJobPostingCommand)
export class CreateJobPostingHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateJobPostingCommand>
{
  constructor(
    @Inject(repo.JOB_POSTING_REPOSITORY)
    private readonly repository: repo.JobPostingRepository,
  ) {
    super();
  }

  async execute(command: CreateJobPostingCommand): Promise<Identifier> {
    const isPublished = command.dto.status === 'published';
    const entity = JobPosting.create({
      tenantId: command.tenantId,
      requisitionId: Identifier.create(command.dto.requisitionId),
      title: command.dto.title,
      description: command.dto.description,
      publishedAt: isPublished ? new Date() : undefined,
      expiredAt: undefined,
      isActive: isPublished,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateJobPostingCommand)
export class UpdateJobPostingHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateJobPostingCommand>
{
  constructor(
    @Inject(repo.JOB_POSTING_REPOSITORY)
    private readonly repository: repo.JobPostingRepository,
  ) {
    super();
  }

  async execute(command: UpdateJobPostingCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobPosting',
      command.id.toString(),
    );

    const isPublished = command.dto.status === 'published';
    const isClosed = command.dto.status === 'closed';

    entity.update({
      title: command.dto.title,
      description: command.dto.description,
      publishedAt: command.dto.publishedAt
        ? new Date(command.dto.publishedAt)
        : isPublished
          ? new Date()
          : undefined,
      expiredAt: command.dto.closedAt
        ? new Date(command.dto.closedAt)
        : isClosed
          ? new Date()
          : undefined,
      isActive: isClosed ? false : isPublished ? true : undefined,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(PublishJobPostingCommand)
export class PublishJobPostingHandler
  extends BaseCommandHandler
  implements ICommandHandler<PublishJobPostingCommand>
{
  constructor(
    @Inject(repo.JOB_POSTING_REPOSITORY)
    private readonly repository: repo.JobPostingRepository,
  ) {
    super();
  }

  async execute(command: PublishJobPostingCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobPosting',
      command.id.toString(),
    );

    entity.publish();
    await this.repository.update(entity);
  }
}

@CommandHandler(CloseJobPostingCommand)
export class CloseJobPostingHandler
  extends BaseCommandHandler
  implements ICommandHandler<CloseJobPostingCommand>
{
  constructor(
    @Inject(repo.JOB_POSTING_REPOSITORY)
    private readonly repository: repo.JobPostingRepository,
  ) {
    super();
  }

  async execute(command: CloseJobPostingCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobPosting',
      command.id.toString(),
    );

    entity.close();
    await this.repository.update(entity);
  }
}
