import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/employee-salary-assignment.repository';
import { EmployeeSalaryAssignmentReadModel } from '../read-models/payroll.read-models';
import { PayrollReadModelMappers } from '../mappers/payroll.read-model.mappers';

// --- Queries ---

export class GetEmployeeSalaryAssignmentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListEmployeeSalaryAssignmentsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class ListSalaryAssignmentsByEmploymentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employmentId: Identifier,
  ) {}
}

// --- Handlers ---

@QueryHandler(GetEmployeeSalaryAssignmentQuery)
export class GetEmployeeSalaryAssignmentHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetEmployeeSalaryAssignmentQuery>
{
  constructor(
    @Inject(repo.EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY)
    private readonly repository: repo.EmployeeSalaryAssignmentRepository,
  ) {
    super();
  }

  async execute(
    query: GetEmployeeSalaryAssignmentQuery,
  ): Promise<EmployeeSalaryAssignmentReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'EmployeeSalaryAssignment',
      query.id.toString(),
    );
    return PayrollReadModelMappers.toEmployeeSalaryAssignmentReadModel(entity);
  }
}

@QueryHandler(ListEmployeeSalaryAssignmentsQuery)
export class ListEmployeeSalaryAssignmentsHandler implements IQueryHandler<ListEmployeeSalaryAssignmentsQuery> {
  constructor(
    @Inject(repo.EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY)
    private readonly repository: repo.EmployeeSalaryAssignmentRepository,
  ) {}

  async execute(
    query: ListEmployeeSalaryAssignmentsQuery,
  ): Promise<EmployeeSalaryAssignmentReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(PayrollReadModelMappers.toEmployeeSalaryAssignmentReadModel);
  }
}

@QueryHandler(ListSalaryAssignmentsByEmploymentQuery)
export class ListSalaryAssignmentsByEmploymentHandler implements IQueryHandler<ListSalaryAssignmentsByEmploymentQuery> {
  constructor(
    @Inject(repo.EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY)
    private readonly repository: repo.EmployeeSalaryAssignmentRepository,
  ) {}

  async execute(
    query: ListSalaryAssignmentsByEmploymentQuery,
  ): Promise<EmployeeSalaryAssignmentReadModel[]> {
    const list = await this.repository.findByEmploymentId(query.tenantId, query.employmentId);
    return list.map(PayrollReadModelMappers.toEmployeeSalaryAssignmentReadModel);
  }
}
