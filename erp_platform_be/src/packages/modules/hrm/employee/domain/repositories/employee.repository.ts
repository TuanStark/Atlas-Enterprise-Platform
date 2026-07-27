import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Employee } from '../aggregates/employee.aggregate';

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface EmployeeRepository {
  save(employee: Employee): Promise<void>;
  update(employee: Employee): Promise<void>;
  delete(employee: Employee): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<Employee | null>;
  findByEmployeeNo(tenantId: Identifier, employeeNo: string): Promise<Employee | null>;
  existsByEmployeeNo(tenantId: Identifier, employeeNo: string): Promise<boolean>;
  findAll(
    tenantId: Identifier,
    options?: {
      page?: number;
      pageSize?: number;
      searchText?: string;
      status?: string;
      departmentId?: string;
    },
  ): Promise<{ data: Employee[]; total: number }>;
  findEmploymentsByEmployeeIds(tenantId: Identifier, employeeIds: string[]): Promise<any[]>;
}
