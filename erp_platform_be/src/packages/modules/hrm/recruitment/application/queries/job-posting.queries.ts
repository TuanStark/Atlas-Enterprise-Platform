import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/job-posting.repository';
import { JobPostingReadModel } from '../read-models/recruitment.read-models';
import { RecruitmentReadModelMappers } from '../mappers/recruitment.read-model.mappers';

// --- Queries ---

export class GetJobPostingQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListJobPostingsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetJobPostingQuery)
export class GetJobPostingHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetJobPostingQuery>
{
  constructor(
    @Inject(repo.JOB_POSTING_REPOSITORY)
    private readonly repository: repo.JobPostingRepository,
  ) {
    super();
  }

  async execute(query: GetJobPostingQuery): Promise<JobPostingReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'JobPosting',
      query.id.toString(),
    );
    return RecruitmentReadModelMappers.toJobPostingReadModel(entity);
  }
}

@QueryHandler(ListJobPostingsQuery)
export class ListJobPostingsHandler implements IQueryHandler<ListJobPostingsQuery> {
  constructor(
    @Inject(repo.JOB_POSTING_REPOSITORY)
    private readonly repository: repo.JobPostingRepository,
  ) {}

  async execute(query: ListJobPostingsQuery): Promise<JobPostingReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(RecruitmentReadModelMappers.toJobPostingReadModel);
  }
}
