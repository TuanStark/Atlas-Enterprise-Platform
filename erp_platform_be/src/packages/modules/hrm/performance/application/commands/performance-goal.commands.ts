import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { PerformanceGoal } from '../../domain/aggregates/performance-goal.aggregate';
import { PerformanceGoalProgress } from '../../domain/entities/performance-goal-progress.entity';
import * as repo from '../../domain/repositories/performance-goal.repository';
import {
  CreatePerformanceGoalDto,
  UpdatePerformanceGoalDto,
  UpdateGoalProgressDto,
} from '../dto/performance-goal.dto';

// --- Commands ---

export class CreatePerformanceGoalCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreatePerformanceGoalDto,
  ) {}
}

export class UpdatePerformanceGoalCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdatePerformanceGoalDto,
  ) {}
}

export class DeletePerformanceGoalCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class UpdateGoalProgressCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateGoalProgressDto,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreatePerformanceGoalCommand)
export class CreatePerformanceGoalHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreatePerformanceGoalCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_GOAL_REPOSITORY)
    private readonly repository: repo.PerformanceGoalRepository,
  ) {
    super();
  }

  async execute(command: CreatePerformanceGoalCommand): Promise<Identifier> {
    const entity = PerformanceGoal.create({
      tenantId: command.tenantId,
      employmentId: Identifier.create(command.dto.employmentId),
      performanceCycleId: Identifier.create(command.dto.performanceCycleId),
      title: command.dto.title,
      description: command.dto.description,
      targetValue: command.dto.targetValue,
      weight: command.dto.weight,
      dueDate: command.dto.dueDate ? new Date(command.dto.dueDate) : undefined,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdatePerformanceGoalCommand)
export class UpdatePerformanceGoalHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdatePerformanceGoalCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_GOAL_REPOSITORY)
    private readonly repository: repo.PerformanceGoalRepository,
  ) {
    super();
  }

  async execute(command: UpdatePerformanceGoalCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PerformanceGoal',
      command.id.toString(),
    );

    entity.update({
      title: command.dto.title,
      description: command.dto.description,
      targetValue: command.dto.targetValue,
      weight: command.dto.weight,
      dueDate: command.dto.dueDate ? new Date(command.dto.dueDate) : undefined,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeletePerformanceGoalCommand)
export class DeletePerformanceGoalHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeletePerformanceGoalCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_GOAL_REPOSITORY)
    private readonly repository: repo.PerformanceGoalRepository,
  ) {
    super();
  }

  async execute(command: DeletePerformanceGoalCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PerformanceGoal',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}

@CommandHandler(UpdateGoalProgressCommand)
export class UpdateGoalProgressHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateGoalProgressCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_GOAL_REPOSITORY)
    private readonly repository: repo.PerformanceGoalRepository,
  ) {
    super();
  }

  async execute(command: UpdateGoalProgressCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PerformanceGoal',
      command.id.toString(),
    );

    const progress = PerformanceGoalProgress.create({
      goalId: entity.id,
      progress: command.dto.progress,
      note: command.dto.note,
      updatedByPrincipalId: command.dto.updatedByPrincipalId
        ? Identifier.create(command.dto.updatedByPrincipalId)
        : undefined,
    });

    entity.addProgress(progress);
    await this.repository.update(entity);
  }
}
