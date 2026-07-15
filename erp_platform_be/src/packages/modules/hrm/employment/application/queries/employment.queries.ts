import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/employment.repository';
import { EmploymentReadModel } from '../read-models/employment.read-model';
import { EmploymentReadModelMapper } from '../mappers/employment.read-model.mapper';

// --- Queries ---

export class GetEmploymentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListEmploymentsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class GetEmploymentsByEmployeeQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employeeId: Identifier,
  ) {}
}

// --- Handlers ---

@QueryHandler(GetEmploymentQuery)
export class GetEmploymentHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetEmploymentQuery>
{
  constructor(
    @Inject(repo.EMPLOYMENT_REPOSITORY)
    private readonly repository: repo.EmploymentRepository,
  ) {
    super();
  }

  async execute(query: GetEmploymentQuery): Promise<EmploymentReadModel> {
    const employment = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'Employment',
      query.id.toString(),
    );
    return EmploymentReadModelMapper.toReadModel(employment);
  }
}

@QueryHandler(ListEmploymentsQuery)
export class ListEmploymentsHandler implements IQueryHandler<ListEmploymentsQuery> {
  constructor(
    @Inject(repo.EMPLOYMENT_REPOSITORY)
    private readonly repository: repo.EmploymentRepository,
  ) {}

  async execute(query: ListEmploymentsQuery): Promise<EmploymentReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(EmploymentReadModelMapper.toReadModel);
  }
}

@QueryHandler(GetEmploymentsByEmployeeQuery)
export class GetEmploymentsByEmployeeHandler implements IQueryHandler<GetEmploymentsByEmployeeQuery> {
  constructor(
    @Inject(repo.EMPLOYMENT_REPOSITORY)
    private readonly repository: repo.EmploymentRepository,
  ) {}

  async execute(query: GetEmploymentsByEmployeeQuery): Promise<EmploymentReadModel[]> {
    const list = await this.repository.findByEmployeeId(query.tenantId, query.employeeId);
    return list.map(EmploymentReadModelMapper.toReadModel);
  }
}
