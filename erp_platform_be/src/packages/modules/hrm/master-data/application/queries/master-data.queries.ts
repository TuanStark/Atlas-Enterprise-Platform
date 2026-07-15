import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';

// Repositories
import * as etRepo from '../../domain/repositories/employment-type.repository';
import * as ctRepo from '../../domain/repositories/contract-type.repository';
import * as jtRepo from '../../domain/repositories/job-title.repository';
import * as wlRepo from '../../domain/repositories/work-location.repository';

// Read Models
import {
  EmploymentTypeReadModel,
  ContractTypeReadModel,
  JobTitleReadModel,
  WorkLocationReadModel,
} from '../read-models/master-data.read-models';

// Mappers
import {
  EmploymentTypeReadModelMapper,
  ContractTypeReadModelMapper,
  JobTitleReadModelMapper,
  WorkLocationReadModelMapper,
} from '../mappers/master-data.read-model.mappers';

// --- Queries ---

export class GetEmploymentTypeQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListEmploymentTypesQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class GetContractTypeQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListContractTypesQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class GetJobTitleQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListJobTitlesQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class GetWorkLocationQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListWorkLocationsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Query Handlers ---

@QueryHandler(GetEmploymentTypeQuery)
export class GetEmploymentTypeHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetEmploymentTypeQuery>
{
  constructor(
    @Inject(etRepo.EMPLOYMENT_TYPE_REPOSITORY)
    private readonly repository: etRepo.EmploymentTypeRepository,
  ) {
    super();
  }

  async execute(query: GetEmploymentTypeQuery): Promise<EmploymentTypeReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'EmploymentType',
      query.id.toString(),
    );
    return EmploymentTypeReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListEmploymentTypesQuery)
export class ListEmploymentTypesHandler implements IQueryHandler<ListEmploymentTypesQuery> {
  constructor(
    @Inject(etRepo.EMPLOYMENT_TYPE_REPOSITORY)
    private readonly repository: etRepo.EmploymentTypeRepository,
  ) {}

  async execute(query: ListEmploymentTypesQuery): Promise<EmploymentTypeReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(EmploymentTypeReadModelMapper.toReadModel);
  }
}

@QueryHandler(GetContractTypeQuery)
export class GetContractTypeHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetContractTypeQuery>
{
  constructor(
    @Inject(ctRepo.CONTRACT_TYPE_REPOSITORY)
    private readonly repository: ctRepo.ContractTypeRepository,
  ) {
    super();
  }

  async execute(query: GetContractTypeQuery): Promise<ContractTypeReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'ContractType',
      query.id.toString(),
    );
    return ContractTypeReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListContractTypesQuery)
export class ListContractTypesHandler implements IQueryHandler<ListContractTypesQuery> {
  constructor(
    @Inject(ctRepo.CONTRACT_TYPE_REPOSITORY)
    private readonly repository: ctRepo.ContractTypeRepository,
  ) {}

  async execute(query: ListContractTypesQuery): Promise<ContractTypeReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(ContractTypeReadModelMapper.toReadModel);
  }
}

@QueryHandler(GetJobTitleQuery)
export class GetJobTitleHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetJobTitleQuery>
{
  constructor(
    @Inject(jtRepo.JOB_TITLE_REPOSITORY)
    private readonly repository: jtRepo.JobTitleRepository,
  ) {
    super();
  }

  async execute(query: GetJobTitleQuery): Promise<JobTitleReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'JobTitle',
      query.id.toString(),
    );
    return JobTitleReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListJobTitlesQuery)
export class ListJobTitlesHandler implements IQueryHandler<ListJobTitlesQuery> {
  constructor(
    @Inject(jtRepo.JOB_TITLE_REPOSITORY)
    private readonly repository: jtRepo.JobTitleRepository,
  ) {}

  async execute(query: ListJobTitlesQuery): Promise<JobTitleReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(JobTitleReadModelMapper.toReadModel);
  }
}

@QueryHandler(GetWorkLocationQuery)
export class GetWorkLocationHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetWorkLocationQuery>
{
  constructor(
    @Inject(wlRepo.WORK_LOCATION_REPOSITORY)
    private readonly repository: wlRepo.WorkLocationRepository,
  ) {
    super();
  }

  async execute(query: GetWorkLocationQuery): Promise<WorkLocationReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'WorkLocation',
      query.id.toString(),
    );
    return WorkLocationReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListWorkLocationsQuery)
export class ListWorkLocationsHandler implements IQueryHandler<ListWorkLocationsQuery> {
  constructor(
    @Inject(wlRepo.WORK_LOCATION_REPOSITORY)
    private readonly repository: wlRepo.WorkLocationRepository,
  ) {}

  async execute(query: ListWorkLocationsQuery): Promise<WorkLocationReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(WorkLocationReadModelMapper.toReadModel);
  }
}
