import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/job-requisition.repository';
import { JobRequisitionReadModel } from '../read-models/recruitment.read-models';
import { RecruitmentReadModelMappers } from '../mappers/recruitment.read-model.mappers';

// --- Queries ---

export class GetJobRequisitionQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListJobRequisitionsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetJobRequisitionQuery)
export class GetJobRequisitionHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetJobRequisitionQuery>
{
  constructor(
    @Inject(repo.JOB_REQUISITION_REPOSITORY)
    private readonly repository: repo.JobRequisitionRepository,
  ) {
    super();
  }

  async execute(query: GetJobRequisitionQuery): Promise<JobRequisitionReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'JobRequisition',
      query.id.toString(),
    );
    return RecruitmentReadModelMappers.toJobRequisitionReadModel(entity);
  }
}

@QueryHandler(ListJobRequisitionsQuery)
export class ListJobRequisitionsHandler implements IQueryHandler<ListJobRequisitionsQuery> {
  constructor(
    @Inject(repo.JOB_REQUISITION_REPOSITORY)
    private readonly repository: repo.JobRequisitionRepository,
  ) {}

  async execute(query: ListJobRequisitionsQuery): Promise<JobRequisitionReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(RecruitmentReadModelMappers.toJobRequisitionReadModel);
  }
}
