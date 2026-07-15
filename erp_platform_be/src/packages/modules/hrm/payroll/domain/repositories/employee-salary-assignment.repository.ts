import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EmployeeSalaryAssignment } from '../aggregates/employee-salary-assignment.aggregate';

export const EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY = Symbol(
  'EMPLOYEE_SALARY_ASSIGNMENT_REPOSITORY',
);

export interface EmployeeSalaryAssignmentRepository {
  save(entity: EmployeeSalaryAssignment): Promise<void>;
  update(entity: EmployeeSalaryAssignment): Promise<void>;
  delete(entity: EmployeeSalaryAssignment): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<EmployeeSalaryAssignment | null>;
  findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<EmployeeSalaryAssignment[]>;
  findAll(tenantId: Identifier): Promise<EmployeeSalaryAssignment[]>;
}
