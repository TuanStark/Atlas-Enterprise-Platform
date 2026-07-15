import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/training-course.repository';
import { TrainingCourseReadModel } from '../read-models/training.read-models';
import { TrainingReadModelMappers } from '../mappers/training.read-model.mappers';

// --- Queries ---

export class GetTrainingCourseQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListTrainingCoursesQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetTrainingCourseQuery)
export class GetTrainingCourseHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetTrainingCourseQuery>
{
  constructor(
    @Inject(repo.TRAINING_COURSE_REPOSITORY)
    private readonly repository: repo.TrainingCourseRepository,
  ) {
    super();
  }

  async execute(query: GetTrainingCourseQuery): Promise<TrainingCourseReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'TrainingCourse',
      query.id.toString(),
    );
    return TrainingReadModelMappers.toTrainingCourseReadModel(entity);
  }
}

@QueryHandler(ListTrainingCoursesQuery)
export class ListTrainingCoursesHandler implements IQueryHandler<ListTrainingCoursesQuery> {
  constructor(
    @Inject(repo.TRAINING_COURSE_REPOSITORY)
    private readonly repository: repo.TrainingCourseRepository,
  ) {}

  async execute(query: ListTrainingCoursesQuery): Promise<TrainingCourseReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(TrainingReadModelMappers.toTrainingCourseReadModel);
  }
}
