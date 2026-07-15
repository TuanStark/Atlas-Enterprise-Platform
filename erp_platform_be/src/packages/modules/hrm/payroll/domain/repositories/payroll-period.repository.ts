import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PayrollPeriod } from '../aggregates/payroll-period.aggregate';

export const PAYROLL_PERIOD_REPOSITORY = Symbol('PAYROLL_PERIOD_REPOSITORY');

export interface PayrollPeriodRepository {
  save(entity: PayrollPeriod): Promise<void>;
  update(entity: PayrollPeriod): Promise<void>;
  delete(entity: PayrollPeriod): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<PayrollPeriod | null>;
  findAll(tenantId: Identifier): Promise<PayrollPeriod[]>;
}
