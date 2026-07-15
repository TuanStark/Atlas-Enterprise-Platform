import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/performance-rating.repository';
import { PerformanceRatingReadModel } from '../read-models/performance.read-models';
import { PerformanceReadModelMappers } from '../mappers/performance.read-model.mappers';

// --- Queries ---

export class GetPerformanceRatingQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListPerformanceRatingsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetPerformanceRatingQuery)
export class GetPerformanceRatingHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetPerformanceRatingQuery>
{
  constructor(
    @Inject(repo.PERFORMANCE_RATING_REPOSITORY)
    private readonly repository: repo.PerformanceRatingRepository,
  ) {
    super();
  }

  async execute(query: GetPerformanceRatingQuery): Promise<PerformanceRatingReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'PerformanceRating',
      query.id.toString(),
    );
    return PerformanceReadModelMappers.toPerformanceRatingReadModel(entity);
  }
}

@QueryHandler(ListPerformanceRatingsQuery)
export class ListPerformanceRatingsHandler implements IQueryHandler<ListPerformanceRatingsQuery> {
  constructor(
    @Inject(repo.PERFORMANCE_RATING_REPOSITORY)
    private readonly repository: repo.PerformanceRatingRepository,
  ) {}

  async execute(query: ListPerformanceRatingsQuery): Promise<PerformanceRatingReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(PerformanceReadModelMappers.toPerformanceRatingReadModel);
  }
}
