import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { PerformanceCycle } from '../../domain/aggregates/performance-cycle.aggregate';
import * as repo from '../../domain/repositories/performance-cycle.repository';
import { CreatePerformanceCycleDto, UpdatePerformanceCycleDto } from '../dto/performance-cycle.dto';

// --- Commands ---

export class CreatePerformanceCycleCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreatePerformanceCycleDto,
  ) {}
}

export class UpdatePerformanceCycleCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdatePerformanceCycleDto,
  ) {}
}

export class DeletePerformanceCycleCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreatePerformanceCycleCommand)
export class CreatePerformanceCycleHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreatePerformanceCycleCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_CYCLE_REPOSITORY)
    private readonly repository: repo.PerformanceCycleRepository,
  ) {
    super();
  }

  async execute(command: CreatePerformanceCycleCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('PerformanceCycle', 'code', command.dto.code);
    }

    const entity = PerformanceCycle.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      startDate: command.dto.startDate ? new Date(command.dto.startDate) : undefined,
      endDate: command.dto.endDate ? new Date(command.dto.endDate) : undefined,
      isActive: command.dto.isActive,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdatePerformanceCycleCommand)
export class UpdatePerformanceCycleHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdatePerformanceCycleCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_CYCLE_REPOSITORY)
    private readonly repository: repo.PerformanceCycleRepository,
  ) {
    super();
  }

  async execute(command: UpdatePerformanceCycleCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PerformanceCycle',
      command.id.toString(),
    );

    entity.update({
      code: command.dto.code,
      name: command.dto.name,
      startDate: command.dto.startDate ? new Date(command.dto.startDate) : undefined,
      endDate: command.dto.endDate ? new Date(command.dto.endDate) : undefined,
      isActive: command.dto.isActive,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeletePerformanceCycleCommand)
export class DeletePerformanceCycleHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeletePerformanceCycleCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_CYCLE_REPOSITORY)
    private readonly repository: repo.PerformanceCycleRepository,
  ) {
    super();
  }

  async execute(command: DeletePerformanceCycleCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PerformanceCycle',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
