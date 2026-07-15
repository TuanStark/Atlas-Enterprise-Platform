import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Payroll } from '../aggregates/payroll.aggregate';

export const PAYROLL_REPOSITORY = Symbol('PAYROLL_REPOSITORY');

export interface PayrollRepository {
  save(entity: Payroll): Promise<void>;
  update(entity: Payroll): Promise<void>;
  delete(entity: Payroll): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<Payroll | null>;
  findByPeriodAndEmployment(
    tenantId: Identifier,
    periodId: Identifier,
    employmentId: Identifier,
  ): Promise<Payroll | null>;
  findByPeriod(tenantId: Identifier, periodId: Identifier): Promise<Payroll[]>;
  findAll(tenantId: Identifier): Promise<Payroll[]>;
}
