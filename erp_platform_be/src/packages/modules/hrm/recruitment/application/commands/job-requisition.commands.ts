import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { JobRequisition } from '../../domain/aggregates/job-requisition.aggregate';
import * as repo from '../../domain/repositories/job-requisition.repository';
import { CreateJobRequisitionDto, UpdateJobRequisitionDto } from '../dto/job-requisition.dto';

// --- Commands ---

export class CreateJobRequisitionCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateJobRequisitionDto,
  ) {}
}

export class UpdateJobRequisitionCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateJobRequisitionDto,
  ) {}
}

export class ApproveJobRequisitionCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class CloseJobRequisitionCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class CancelJobRequisitionCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateJobRequisitionCommand)
export class CreateJobRequisitionHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateJobRequisitionCommand>
{
  constructor(
    @Inject(repo.JOB_REQUISITION_REPOSITORY)
    private readonly repository: repo.JobRequisitionRepository,
  ) {
    super();
  }

  async execute(command: CreateJobRequisitionCommand): Promise<Identifier> {
    const entity = JobRequisition.create({
      tenantId: command.tenantId,
      code: command.dto.code || 'REQ-' + Math.floor(Math.random() * 1000000),
      title: command.dto.title,
      departmentId: Identifier.create(command.dto.departmentId || ''),
      positionId: Identifier.create(command.dto.jobTitleId || ''),
      quantity: command.dto.vacancies,
      status: command.dto.status,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateJobRequisitionCommand)
export class UpdateJobRequisitionHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateJobRequisitionCommand>
{
  constructor(
    @Inject(repo.JOB_REQUISITION_REPOSITORY)
    private readonly repository: repo.JobRequisitionRepository,
  ) {
    super();
  }

  async execute(command: UpdateJobRequisitionCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobRequisition',
      command.id.toString(),
    );

    entity.update({
      code: command.dto.code,
      title: command.dto.title,
      departmentId: command.dto.departmentId
        ? Identifier.create(command.dto.departmentId)
        : undefined,
      positionId: command.dto.jobTitleId ? Identifier.create(command.dto.jobTitleId) : undefined,
      quantity: command.dto.vacancies,
      status: command.dto.status,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(ApproveJobRequisitionCommand)
export class ApproveJobRequisitionHandler
  extends BaseCommandHandler
  implements ICommandHandler<ApproveJobRequisitionCommand>
{
  constructor(
    @Inject(repo.JOB_REQUISITION_REPOSITORY)
    private readonly repository: repo.JobRequisitionRepository,
  ) {
    super();
  }

  async execute(command: ApproveJobRequisitionCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobRequisition',
      command.id.toString(),
    );

    entity.approve();
    await this.repository.update(entity);
  }
}

@CommandHandler(CloseJobRequisitionCommand)
export class CloseJobRequisitionHandler
  extends BaseCommandHandler
  implements ICommandHandler<CloseJobRequisitionCommand>
{
  constructor(
    @Inject(repo.JOB_REQUISITION_REPOSITORY)
    private readonly repository: repo.JobRequisitionRepository,
  ) {
    super();
  }

  async execute(command: CloseJobRequisitionCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobRequisition',
      command.id.toString(),
    );

    entity.close();
    await this.repository.update(entity);
  }
}

@CommandHandler(CancelJobRequisitionCommand)
export class CancelJobRequisitionHandler
  extends BaseCommandHandler
  implements ICommandHandler<CancelJobRequisitionCommand>
{
  constructor(
    @Inject(repo.JOB_REQUISITION_REPOSITORY)
    private readonly repository: repo.JobRequisitionRepository,
  ) {
    super();
  }

  async execute(command: CancelJobRequisitionCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'JobRequisition',
      command.id.toString(),
    );

    entity.cancel();
    await this.repository.update(entity);
  }
}
