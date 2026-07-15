import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { PerformanceRating } from '../../domain/aggregates/performance-rating.aggregate';
import * as repo from '../../domain/repositories/performance-rating.repository';
import {
  CreatePerformanceRatingDto,
  UpdatePerformanceRatingDto,
} from '../dto/performance-rating.dto';

// --- Commands ---

export class CreatePerformanceRatingCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreatePerformanceRatingDto,
  ) {}
}

export class UpdatePerformanceRatingCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdatePerformanceRatingDto,
  ) {}
}

export class DeletePerformanceRatingCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreatePerformanceRatingCommand)
export class CreatePerformanceRatingHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreatePerformanceRatingCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_RATING_REPOSITORY)
    private readonly repository: repo.PerformanceRatingRepository,
  ) {
    super();
  }

  async execute(command: CreatePerformanceRatingCommand): Promise<Identifier> {
    const entity = PerformanceRating.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      score: command.dto.score,
      description: command.dto.description,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdatePerformanceRatingCommand)
export class UpdatePerformanceRatingHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdatePerformanceRatingCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_RATING_REPOSITORY)
    private readonly repository: repo.PerformanceRatingRepository,
  ) {
    super();
  }

  async execute(command: UpdatePerformanceRatingCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PerformanceRating',
      command.id.toString(),
    );

    entity.update({
      code: command.dto.code,
      name: command.dto.name,
      score: command.dto.score,
      description: command.dto.description,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeletePerformanceRatingCommand)
export class DeletePerformanceRatingHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeletePerformanceRatingCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_RATING_REPOSITORY)
    private readonly repository: repo.PerformanceRatingRepository,
  ) {
    super();
  }

  async execute(command: DeletePerformanceRatingCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PerformanceRating',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
