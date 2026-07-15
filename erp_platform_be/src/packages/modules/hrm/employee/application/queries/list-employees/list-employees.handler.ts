import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListEmployeesQuery } from './list-employees.query';
import * as employeeRepo from '../../../domain/repositories/employee.repository';
import { EmployeeReadModelMapper } from '../../mappers/employee.read-model.mapper';
import { EmployeeReadModel } from '../../read-models/employee.read-model';

@QueryHandler(ListEmployeesQuery)
export class ListEmployeesHandler implements IQueryHandler<ListEmployeesQuery> {
  constructor(
    @Inject(employeeRepo.EMPLOYEE_REPOSITORY)
    private readonly repository: employeeRepo.EmployeeRepository,
  ) {}

  async execute(query: ListEmployeesQuery): Promise<EmployeeReadModel[]> {
    const employees = await this.repository.findAll(query.tenantId);
    return employees.map(EmployeeReadModelMapper.toReadModel);
  }
}
