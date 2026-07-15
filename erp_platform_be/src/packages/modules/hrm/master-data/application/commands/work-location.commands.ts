import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { WorkLocation } from '../../domain/entities/work-location.entity';
import * as repo from '../../domain/repositories/work-location.repository';
import { CreateWorkLocationDto, UpdateWorkLocationDto } from '../dto/work-location.dto';

// --- Commands ---

export class CreateWorkLocationCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateWorkLocationDto,
  ) {}
}

export class UpdateWorkLocationCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateWorkLocationDto,
  ) {}
}

export class DeleteWorkLocationCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateWorkLocationCommand)
export class CreateWorkLocationHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateWorkLocationCommand>
{
  constructor(
    @Inject(repo.WORK_LOCATION_REPOSITORY)
    private readonly repository: repo.WorkLocationRepository,
  ) {
    super();
  }

  async execute(command: CreateWorkLocationCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('WorkLocation', 'code', command.dto.code);
    }

    const entity = WorkLocation.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      address: command.dto.address,
      timezone: command.dto.timezone,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateWorkLocationCommand)
export class UpdateWorkLocationHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateWorkLocationCommand>
{
  constructor(
    @Inject(repo.WORK_LOCATION_REPOSITORY)
    private readonly repository: repo.WorkLocationRepository,
  ) {
    super();
  }

  async execute(command: UpdateWorkLocationCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'WorkLocation',
      command.id.toString(),
    );

    entity.update(command.dto.name, command.dto.address, command.dto.timezone);

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteWorkLocationCommand)
export class DeleteWorkLocationHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteWorkLocationCommand>
{
  constructor(
    @Inject(repo.WORK_LOCATION_REPOSITORY)
    private readonly repository: repo.WorkLocationRepository,
  ) {
    super();
  }

  async execute(command: DeleteWorkLocationCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'WorkLocation',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
