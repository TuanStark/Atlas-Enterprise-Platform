import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/job-application.repository';
import { JobApplicationReadModel } from '../read-models/recruitment.read-models';
import { RecruitmentReadModelMappers } from '../mappers/recruitment.read-model.mappers';

// --- Queries ---

export class GetJobApplicationQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListJobApplicationsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetJobApplicationQuery)
export class GetJobApplicationHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetJobApplicationQuery>
{
  constructor(
    @Inject(repo.JOB_APPLICATION_REPOSITORY)
    private readonly repository: repo.JobApplicationRepository,
  ) {
    super();
  }

  async execute(query: GetJobApplicationQuery): Promise<JobApplicationReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'JobApplication',
      query.id.toString(),
    );
    return RecruitmentReadModelMappers.toJobApplicationReadModel(entity);
  }
}

@QueryHandler(ListJobApplicationsQuery)
export class ListJobApplicationsHandler implements IQueryHandler<ListJobApplicationsQuery> {
  constructor(
    @Inject(repo.JOB_APPLICATION_REPOSITORY)
    private readonly repository: repo.JobApplicationRepository,
  ) {}

  async execute(query: ListJobApplicationsQuery): Promise<JobApplicationReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(RecruitmentReadModelMappers.toJobApplicationReadModel);
  }
}
