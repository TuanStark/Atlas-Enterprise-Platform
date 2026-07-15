import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/salary-component.repository';
import { SalaryComponentReadModel } from '../read-models/payroll.read-models';
import { PayrollReadModelMappers } from '../mappers/payroll.read-model.mappers';

// --- Queries ---

export class GetSalaryComponentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListSalaryComponentsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetSalaryComponentQuery)
export class GetSalaryComponentHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetSalaryComponentQuery>
{
  constructor(
    @Inject(repo.SALARY_COMPONENT_REPOSITORY)
    private readonly repository: repo.SalaryComponentRepository,
  ) {
    super();
  }

  async execute(query: GetSalaryComponentQuery): Promise<SalaryComponentReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'SalaryComponent',
      query.id.toString(),
    );
    return PayrollReadModelMappers.toSalaryComponentReadModel(entity);
  }
}

@QueryHandler(ListSalaryComponentsQuery)
export class ListSalaryComponentsHandler implements IQueryHandler<ListSalaryComponentsQuery> {
  constructor(
    @Inject(repo.SALARY_COMPONENT_REPOSITORY)
    private readonly repository: repo.SalaryComponentRepository,
  ) {}

  async execute(query: ListSalaryComponentsQuery): Promise<SalaryComponentReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(PayrollReadModelMappers.toSalaryComponentReadModel);
  }
}
