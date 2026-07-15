import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { JobTitle } from '../../domain/entities/job-title.entity';
import * as repo from '../../domain/repositories/job-title.repository';
import { CreateJobTitleDto, UpdateJobTitleDto } from '../dto/job-title.dto';

// --- Commands ---

export class CreateJobTitleCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateJobTitleDto,
  ) {}
}

export class UpdateJobTitleCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateJobTitleDto,
  ) {}
}

export class DeleteJobTitleCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateJobTitleCommand)
export class CreateJobTitleHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateJobTitleCommand>
{
  constructor(
    @Inject(repo.JOB_TITLE_REPOSITORY)
    private readonly repository: repo.JobTitleRepository,
  ) {
    super();
  }

  async execute(command: CreateJobTitleCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('JobTitle', 'code', command.dto.code);
    }

    const entity = JobTitle.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      description: command.dto.description,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateJobTitleCommand)
export class UpdateJobTitleHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateJobTitleCommand>
{
  constructor(
    @Inject(repo.JOB_TITLE_REPOSITORY)
    private readonly repository: repo.JobTitleRepository,
  ) {
    super();
  }

  async execute(command: UpdateJobTitleCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobTitle',
      command.id.toString(),
    );

    entity.update(command.dto.name, command.dto.description, command.dto.isActive);

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteJobTitleCommand)
export class DeleteJobTitleHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteJobTitleCommand>
{
  constructor(
    @Inject(repo.JOB_TITLE_REPOSITORY)
    private readonly repository: repo.JobTitleRepository,
  ) {
    super();
  }

  async execute(command: DeleteJobTitleCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobTitle',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
