import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/candidate.repository';
import { CandidateReadModel } from '../read-models/recruitment.read-models';
import { RecruitmentReadModelMappers } from '../mappers/recruitment.read-model.mappers';

// --- Queries ---

export class GetCandidateQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListCandidatesQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetCandidateQuery)
export class GetCandidateHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetCandidateQuery>
{
  constructor(
    @Inject(repo.CANDIDATE_REPOSITORY)
    private readonly repository: repo.CandidateRepository,
  ) {
    super();
  }

  async execute(query: GetCandidateQuery): Promise<CandidateReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'Candidate',
      query.id.toString(),
    );
    return RecruitmentReadModelMappers.toCandidateReadModel(entity);
  }
}

@QueryHandler(ListCandidatesQuery)
export class ListCandidatesHandler implements IQueryHandler<ListCandidatesQuery> {
  constructor(
    @Inject(repo.CANDIDATE_REPOSITORY)
    private readonly repository: repo.CandidateRepository,
  ) {}

  async execute(query: ListCandidatesQuery): Promise<CandidateReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(RecruitmentReadModelMappers.toCandidateReadModel);
  }
}
