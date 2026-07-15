import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/training-session.repository';
import { TrainingSessionReadModel } from '../read-models/training.read-models';
import { TrainingReadModelMappers } from '../mappers/training.read-model.mappers';

// --- Queries ---

export class GetTrainingSessionQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListTrainingSessionsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetTrainingSessionQuery)
export class GetTrainingSessionHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetTrainingSessionQuery>
{
  constructor(
    @Inject(repo.TRAINING_SESSION_REPOSITORY)
    private readonly repository: repo.TrainingSessionRepository,
  ) {
    super();
  }

  async execute(query: GetTrainingSessionQuery): Promise<TrainingSessionReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'TrainingSession',
      query.id.toString(),
    );
    return TrainingReadModelMappers.toTrainingSessionReadModel(entity);
  }
}

@QueryHandler(ListTrainingSessionsQuery)
export class ListTrainingSessionsHandler implements IQueryHandler<ListTrainingSessionsQuery> {
  constructor(
    @Inject(repo.TRAINING_SESSION_REPOSITORY)
    private readonly repository: repo.TrainingSessionRepository,
  ) {}

  async execute(query: ListTrainingSessionsQuery): Promise<TrainingSessionReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(TrainingReadModelMappers.toTrainingSessionReadModel);
  }
}
