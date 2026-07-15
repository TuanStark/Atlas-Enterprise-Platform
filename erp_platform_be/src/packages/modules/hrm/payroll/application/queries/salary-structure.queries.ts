import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/salary-structure.repository';
import { SalaryStructureReadModel } from '../read-models/payroll.read-models';
import { PayrollReadModelMappers } from '../mappers/payroll.read-model.mappers';

// --- Queries ---

export class GetSalaryStructureQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListSalaryStructuresQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetSalaryStructureQuery)
export class GetSalaryStructureHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetSalaryStructureQuery>
{
  constructor(
    @Inject(repo.SALARY_STRUCTURE_REPOSITORY)
    private readonly repository: repo.SalaryStructureRepository,
  ) {
    super();
  }

  async execute(query: GetSalaryStructureQuery): Promise<SalaryStructureReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'SalaryStructure',
      query.id.toString(),
    );
    return PayrollReadModelMappers.toSalaryStructureReadModel(entity);
  }
}

@QueryHandler(ListSalaryStructuresQuery)
export class ListSalaryStructuresHandler implements IQueryHandler<ListSalaryStructuresQuery> {
  constructor(
    @Inject(repo.SALARY_STRUCTURE_REPOSITORY)
    private readonly repository: repo.SalaryStructureRepository,
  ) {}

  async execute(query: ListSalaryStructuresQuery): Promise<SalaryStructureReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(PayrollReadModelMappers.toSalaryStructureReadModel);
  }
}
