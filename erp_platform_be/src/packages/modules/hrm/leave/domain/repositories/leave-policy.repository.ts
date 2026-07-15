import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeavePolicy } from '../aggregates/leave-policy.aggregate';

export const LEAVE_POLICY_REPOSITORY = Symbol('LEAVE_POLICY_REPOSITORY');

export interface LeavePolicyRepository {
  save(entity: LeavePolicy): Promise<void>;
  update(entity: LeavePolicy): Promise<void>;
  delete(entity: LeavePolicy): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<LeavePolicy | null>;
  findByLeaveTypeAndEmploymentType(
    tenantId: Identifier,
    leaveTypeId: Identifier,
    employmentTypeId: Identifier,
  ): Promise<LeavePolicy | null>;
  findAll(tenantId: Identifier): Promise<LeavePolicy[]>;
}
