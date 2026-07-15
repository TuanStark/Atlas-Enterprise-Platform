import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/performance-review.repository';
import { PerformanceReviewReadModel } from '../read-models/performance.read-models';
import { PerformanceReadModelMappers } from '../mappers/performance.read-model.mappers';

// --- Queries ---

export class GetPerformanceReviewQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListPerformanceReviewsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class ListReviewsByEmploymentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employmentId: Identifier,
  ) {}
}

// --- Handlers ---

@QueryHandler(GetPerformanceReviewQuery)
export class GetPerformanceReviewHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetPerformanceReviewQuery>
{
  constructor(
    @Inject(repo.PERFORMANCE_REVIEW_REPOSITORY)
    private readonly repository: repo.PerformanceReviewRepository,
  ) {
    super();
  }

  async execute(query: GetPerformanceReviewQuery): Promise<PerformanceReviewReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'PerformanceReview',
      query.id.toString(),
    );
    return PerformanceReadModelMappers.toPerformanceReviewReadModel(entity);
  }
}

@QueryHandler(ListPerformanceReviewsQuery)
export class ListPerformanceReviewsHandler implements IQueryHandler<ListPerformanceReviewsQuery> {
  constructor(
    @Inject(repo.PERFORMANCE_REVIEW_REPOSITORY)
    private readonly repository: repo.PerformanceReviewRepository,
  ) {}

  async execute(query: ListPerformanceReviewsQuery): Promise<PerformanceReviewReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(PerformanceReadModelMappers.toPerformanceReviewReadModel);
  }
}

@QueryHandler(ListReviewsByEmploymentQuery)
export class ListReviewsByEmploymentHandler implements IQueryHandler<ListReviewsByEmploymentQuery> {
  constructor(
    @Inject(repo.PERFORMANCE_REVIEW_REPOSITORY)
    private readonly repository: repo.PerformanceReviewRepository,
  ) {}

  async execute(query: ListReviewsByEmploymentQuery): Promise<PerformanceReviewReadModel[]> {
    const list = await this.repository.findByEmploymentId(query.tenantId, query.employmentId);
    return list.map(PerformanceReadModelMappers.toPerformanceReviewReadModel);
  }
}
