import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/performance-goal.repository';
import { PerformanceGoalReadModel } from '../read-models/performance.read-models';
import { PerformanceReadModelMappers } from '../mappers/performance.read-model.mappers';

// --- Queries ---

export class GetPerformanceGoalQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListPerformanceGoalsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class ListGoalsByEmploymentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employmentId: Identifier,
  ) {}
}

// --- Handlers ---

@QueryHandler(GetPerformanceGoalQuery)
export class GetPerformanceGoalHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetPerformanceGoalQuery>
{
  constructor(
    @Inject(repo.PERFORMANCE_GOAL_REPOSITORY)
    private readonly repository: repo.PerformanceGoalRepository,
  ) {
    super();
  }

  async execute(query: GetPerformanceGoalQuery): Promise<PerformanceGoalReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'PerformanceGoal',
      query.id.toString(),
    );
    return PerformanceReadModelMappers.toPerformanceGoalReadModel(entity);
  }
}

@QueryHandler(ListPerformanceGoalsQuery)
export class ListPerformanceGoalsHandler implements IQueryHandler<ListPerformanceGoalsQuery> {
  constructor(
    @Inject(repo.PERFORMANCE_GOAL_REPOSITORY)
    private readonly repository: repo.PerformanceGoalRepository,
  ) {}

  async execute(query: ListPerformanceGoalsQuery): Promise<PerformanceGoalReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(PerformanceReadModelMappers.toPerformanceGoalReadModel);
  }
}

@QueryHandler(ListGoalsByEmploymentQuery)
export class ListGoalsByEmploymentHandler implements IQueryHandler<ListGoalsByEmploymentQuery> {
  constructor(
    @Inject(repo.PERFORMANCE_GOAL_REPOSITORY)
    private readonly repository: repo.PerformanceGoalRepository,
  ) {}

  async execute(query: ListGoalsByEmploymentQuery): Promise<PerformanceGoalReadModel[]> {
    const list = await this.repository.findByEmploymentId(query.tenantId, query.employmentId);
    return list.map(PerformanceReadModelMappers.toPerformanceGoalReadModel);
  }
}
