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
    const employeeIds = employees.map((emp) => emp.id.toString());

    const empRecords = await this.repository.findEmploymentsByEmployeeIds(
      query.tenantId,
      employeeIds,
    );

    const employmentsByEmployee = new Map<string, any[]>();
    for (const e of empRecords) {
      const list = employmentsByEmployee.get(e.employeeId) || [];
      list.push(e);
      employmentsByEmployee.set(e.employeeId, list);
    }

    return employees.map((employee) =>
      EmployeeReadModelMapper.toReadModel(employee, employmentsByEmployee.get(employee.id.toString())),
    );
  }
}
