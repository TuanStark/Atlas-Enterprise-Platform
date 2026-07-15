import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { TrainingCourse } from '../../domain/aggregates/training-course.aggregate';
import * as repo from '../../domain/repositories/training-course.repository';
import { CreateTrainingCourseDto, UpdateTrainingCourseDto } from '../dto/training-course.dto';

// --- Commands ---

export class CreateTrainingCourseCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateTrainingCourseDto,
  ) {}
}

export class UpdateTrainingCourseCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateTrainingCourseDto,
  ) {}
}

export class DeleteTrainingCourseCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateTrainingCourseCommand)
export class CreateTrainingCourseHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateTrainingCourseCommand>
{
  constructor(
    @Inject(repo.TRAINING_COURSE_REPOSITORY)
    private readonly repository: repo.TrainingCourseRepository,
  ) {
    super();
  }

  async execute(command: CreateTrainingCourseCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('TrainingCourse', 'code', command.dto.code);
    }

    const entity = TrainingCourse.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      category: command.dto.category,
      durationHours: command.dto.durationHours,
      description: command.dto.description,
      isActive: command.dto.isActive,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateTrainingCourseCommand)
export class UpdateTrainingCourseHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateTrainingCourseCommand>
{
  constructor(
    @Inject(repo.TRAINING_COURSE_REPOSITORY)
    private readonly repository: repo.TrainingCourseRepository,
  ) {
    super();
  }

  async execute(command: UpdateTrainingCourseCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'TrainingCourse',
      command.id.toString(),
    );

    entity.update({
      code: command.dto.code,
      name: command.dto.name,
      category: command.dto.category,
      durationHours: command.dto.durationHours,
      description: command.dto.description,
      isActive: command.dto.isActive,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteTrainingCourseCommand)
export class DeleteTrainingCourseHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteTrainingCourseCommand>
{
  constructor(
    @Inject(repo.TRAINING_COURSE_REPOSITORY)
    private readonly repository: repo.TrainingCourseRepository,
  ) {
    super();
  }

  async execute(command: DeleteTrainingCourseCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'TrainingCourse',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
