import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { TrainingSession } from '../../domain/aggregates/training-session.aggregate';
import * as repo from '../../domain/repositories/training-session.repository';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto } from '../dto/training-session.dto';

// --- Commands ---

export class CreateTrainingSessionCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateTrainingSessionDto,
  ) {}
}

export class UpdateTrainingSessionCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateTrainingSessionDto,
  ) {}
}

export class DeleteTrainingSessionCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateTrainingSessionCommand)
export class CreateTrainingSessionHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateTrainingSessionCommand>
{
  constructor(
    @Inject(repo.TRAINING_SESSION_REPOSITORY)
    private readonly repository: repo.TrainingSessionRepository,
  ) {
    super();
  }

  async execute(command: CreateTrainingSessionCommand): Promise<Identifier> {
    const entity = TrainingSession.create({
      tenantId: command.tenantId,
      courseId: Identifier.create(command.dto.courseId),
      instructorEmploymentId: command.dto.instructorEmploymentId
        ? Identifier.create(command.dto.instructorEmploymentId)
        : undefined,
      startDate: command.dto.startDate ? new Date(command.dto.startDate) : undefined,
      endDate: command.dto.endDate ? new Date(command.dto.endDate) : undefined,
      location: command.dto.location,
      capacity: command.dto.capacity,
      status: command.dto.status,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateTrainingSessionCommand)
export class UpdateTrainingSessionHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateTrainingSessionCommand>
{
  constructor(
    @Inject(repo.TRAINING_SESSION_REPOSITORY)
    private readonly repository: repo.TrainingSessionRepository,
  ) {
    super();
  }

  async execute(command: UpdateTrainingSessionCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'TrainingSession',
      command.id.toString(),
    );

    entity.update({
      instructorEmploymentId: command.dto.instructorEmploymentId
        ? Identifier.create(command.dto.instructorEmploymentId)
        : undefined,
      startDate: command.dto.startDate ? new Date(command.dto.startDate) : undefined,
      endDate: command.dto.endDate ? new Date(command.dto.endDate) : undefined,
      location: command.dto.location,
      capacity: command.dto.capacity,
      status: command.dto.status,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteTrainingSessionCommand)
export class DeleteTrainingSessionHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteTrainingSessionCommand>
{
  constructor(
    @Inject(repo.TRAINING_SESSION_REPOSITORY)
    private readonly repository: repo.TrainingSessionRepository,
  ) {
    super();
  }

  async execute(command: DeleteTrainingSessionCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'TrainingSession',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
