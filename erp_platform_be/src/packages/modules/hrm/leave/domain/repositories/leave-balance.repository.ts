import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveBalance } from '../aggregates/leave-balance.aggregate';

export const LEAVE_BALANCE_REPOSITORY = Symbol('LEAVE_BALANCE_REPOSITORY');

export interface LeaveBalanceRepository {
  save(entity: LeaveBalance): Promise<void>;
  update(entity: LeaveBalance): Promise<void>;
  delete(entity: LeaveBalance): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<LeaveBalance | null>;
  findByEmploymentAndTypeAndYear(
    tenantId: Identifier,
    employmentId: Identifier,
    leaveTypeId: Identifier,
    year: number,
  ): Promise<LeaveBalance | null>;
  findByEmploymentId(tenantId: Identifier, employmentId: Identifier): Promise<LeaveBalance[]>;
  findAll(tenantId: Identifier): Promise<LeaveBalance[]>;
}
