import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEmployeeQuery } from './get-employee.query';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as employeeRepo from '../../../domain/repositories/employee.repository';
import { EmployeeReadModelMapper } from '../../mappers/employee.read-model.mapper';
import { EmployeeReadModel } from '../../read-models/employee.read-model';

@QueryHandler(GetEmployeeQuery)
export class GetEmployeeHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetEmployeeQuery>
{
  constructor(
    @Inject(employeeRepo.EMPLOYEE_REPOSITORY)
    private readonly repository: employeeRepo.EmployeeRepository,
  ) {
    super();
  }

  async execute(query: GetEmployeeQuery): Promise<EmployeeReadModel> {
    const employee = this.ensureFound(
      await this.repository.findById(query.tenantId, query.employeeId),
      'Employee',
      query.employeeId.toString(),
    );

    return EmployeeReadModelMapper.toReadModel(employee);
  }
}
