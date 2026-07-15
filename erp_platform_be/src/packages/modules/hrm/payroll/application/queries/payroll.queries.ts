import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/payroll.repository';
import { PayrollReadModel } from '../read-models/payroll.read-models';
import { PayrollReadModelMappers } from '../mappers/payroll.read-model.mappers';

// --- Queries ---

export class GetPayrollQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListPayrollsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class ListPayrollsByPeriodQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly periodId: Identifier,
  ) {}
}

// --- Handlers ---

@QueryHandler(GetPayrollQuery)
export class GetPayrollHandler extends BaseQueryHandler implements IQueryHandler<GetPayrollQuery> {
  constructor(
    @Inject(repo.PAYROLL_REPOSITORY)
    private readonly repository: repo.PayrollRepository,
  ) {
    super();
  }

  async execute(query: GetPayrollQuery): Promise<PayrollReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'Payroll',
      query.id.toString(),
    );
    return PayrollReadModelMappers.toPayrollReadModel(entity);
  }
}

@QueryHandler(ListPayrollsQuery)
export class ListPayrollsHandler implements IQueryHandler<ListPayrollsQuery> {
  constructor(
    @Inject(repo.PAYROLL_REPOSITORY)
    private readonly repository: repo.PayrollRepository,
  ) {}

  async execute(query: ListPayrollsQuery): Promise<PayrollReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(PayrollReadModelMappers.toPayrollReadModel);
  }
}

@QueryHandler(ListPayrollsByPeriodQuery)
export class ListPayrollsByPeriodHandler implements IQueryHandler<ListPayrollsByPeriodQuery> {
  constructor(
    @Inject(repo.PAYROLL_REPOSITORY)
    private readonly repository: repo.PayrollRepository,
  ) {}

  async execute(query: ListPayrollsByPeriodQuery): Promise<PayrollReadModel[]> {
    const list = await this.repository.findByPeriod(query.tenantId, query.periodId);
    return list.map(PayrollReadModelMappers.toPayrollReadModel);
  }
}
