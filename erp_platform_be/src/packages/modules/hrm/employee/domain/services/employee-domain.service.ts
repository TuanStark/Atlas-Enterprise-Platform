import { Inject, Injectable } from '@nestjs/common';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { Employee, CreateEmployeeProps } from '../aggregates/employee.aggregate';
import { EMPLOYEE_REPOSITORY } from '../repositories/employee.repository';
import type { EmployeeRepository } from '../repositories/employee.repository';

@Injectable()
export class EmployeeDomainService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly repository: EmployeeRepository,
  ) {}

  async create(props: CreateEmployeeProps): Promise<Employee> {
    const exists = await this.repository.existsByEmployeeNo(props.tenantId, props.employeeNo);

    if (exists) {
      throw new EntityAlreadyExistsException('Employee', 'employeeNo', props.employeeNo);
    }

    const employee = Employee.create(props);
    await this.repository.save(employee);

    return employee;
  }
}
