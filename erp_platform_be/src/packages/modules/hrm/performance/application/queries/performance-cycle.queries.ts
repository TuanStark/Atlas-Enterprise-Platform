import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/performance-cycle.repository';
import { PerformanceCycleReadModel } from '../read-models/performance.read-models';
import { PerformanceReadModelMappers } from '../mappers/performance.read-model.mappers';

// --- Queries ---

export class GetPerformanceCycleQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListPerformanceCyclesQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetPerformanceCycleQuery)
export class GetPerformanceCycleHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetPerformanceCycleQuery>
{
  constructor(
    @Inject(repo.PERFORMANCE_CYCLE_REPOSITORY)
    private readonly repository: repo.PerformanceCycleRepository,
  ) {
    super();
  }

  async execute(query: GetPerformanceCycleQuery): Promise<PerformanceCycleReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'PerformanceCycle',
      query.id.toString(),
    );
    return PerformanceReadModelMappers.toPerformanceCycleReadModel(entity);
  }
}

@QueryHandler(ListPerformanceCyclesQuery)
export class ListPerformanceCyclesHandler implements IQueryHandler<ListPerformanceCyclesQuery> {
  constructor(
    @Inject(repo.PERFORMANCE_CYCLE_REPOSITORY)
    private readonly repository: repo.PerformanceCycleRepository,
  ) {}

  async execute(query: ListPerformanceCyclesQuery): Promise<PerformanceCycleReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(PerformanceReadModelMappers.toPerformanceCycleReadModel);
  }
}
