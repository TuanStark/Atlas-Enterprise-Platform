import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/training-enrollment.repository';
import { TrainingEnrollmentReadModel } from '../read-models/training.read-models';
import { TrainingReadModelMappers } from '../mappers/training.read-model.mappers';

// --- Queries ---

export class GetTrainingEnrollmentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListTrainingEnrollmentsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class ListEnrollmentsBySessionQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly sessionId: Identifier,
  ) {}
}

// --- Handlers ---

@QueryHandler(GetTrainingEnrollmentQuery)
export class GetTrainingEnrollmentHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetTrainingEnrollmentQuery>
{
  constructor(
    @Inject(repo.TRAINING_ENROLLMENT_REPOSITORY)
    private readonly repository: repo.TrainingEnrollmentRepository,
  ) {
    super();
  }

  async execute(query: GetTrainingEnrollmentQuery): Promise<TrainingEnrollmentReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'TrainingEnrollment',
      query.id.toString(),
    );
    return TrainingReadModelMappers.toTrainingEnrollmentReadModel(entity);
  }
}

@QueryHandler(ListTrainingEnrollmentsQuery)
export class ListTrainingEnrollmentsHandler implements IQueryHandler<ListTrainingEnrollmentsQuery> {
  constructor(
    @Inject(repo.TRAINING_ENROLLMENT_REPOSITORY)
    private readonly repository: repo.TrainingEnrollmentRepository,
  ) {}

  async execute(query: ListTrainingEnrollmentsQuery): Promise<TrainingEnrollmentReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(TrainingReadModelMappers.toTrainingEnrollmentReadModel);
  }
}

@QueryHandler(ListEnrollmentsBySessionQuery)
export class ListEnrollmentsBySessionHandler implements IQueryHandler<ListEnrollmentsBySessionQuery> {
  constructor(
    @Inject(repo.TRAINING_ENROLLMENT_REPOSITORY)
    private readonly repository: repo.TrainingEnrollmentRepository,
  ) {}

  async execute(query: ListEnrollmentsBySessionQuery): Promise<TrainingEnrollmentReadModel[]> {
    const list = await this.repository.findBySessionId(query.tenantId, query.sessionId);
    return list.map(TrainingReadModelMappers.toTrainingEnrollmentReadModel);
  }
}
