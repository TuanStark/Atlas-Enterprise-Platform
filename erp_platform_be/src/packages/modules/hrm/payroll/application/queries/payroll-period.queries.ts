import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/payroll-period.repository';
import { PayrollPeriodReadModel } from '../read-models/payroll.read-models';
import { PayrollReadModelMappers } from '../mappers/payroll.read-model.mappers';

// --- Queries ---

export class GetPayrollPeriodQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListPayrollPeriodsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

// --- Handlers ---

@QueryHandler(GetPayrollPeriodQuery)
export class GetPayrollPeriodHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetPayrollPeriodQuery>
{
  constructor(
    @Inject(repo.PAYROLL_PERIOD_REPOSITORY)
    private readonly repository: repo.PayrollPeriodRepository,
  ) {
    super();
  }

  async execute(query: GetPayrollPeriodQuery): Promise<PayrollPeriodReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'PayrollPeriod',
      query.id.toString(),
    );
    return PayrollReadModelMappers.toPayrollPeriodReadModel(entity);
  }
}

@QueryHandler(ListPayrollPeriodsQuery)
export class ListPayrollPeriodsHandler implements IQueryHandler<ListPayrollPeriodsQuery> {
  constructor(
    @Inject(repo.PAYROLL_PERIOD_REPOSITORY)
    private readonly repository: repo.PayrollPeriodRepository,
  ) {}

  async execute(query: ListPayrollPeriodsQuery): Promise<PayrollPeriodReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(PayrollReadModelMappers.toPayrollPeriodReadModel);
  }
}
