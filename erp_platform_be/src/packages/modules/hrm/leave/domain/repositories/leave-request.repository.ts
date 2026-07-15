import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveRequest } from '../aggregates/leave-request.aggregate';

export const LEAVE_REQUEST_REPOSITORY = Symbol('LEAVE_REQUEST_REPOSITORY');

export interface LeaveRequestRepository {
  save(entity: LeaveRequest): Promise<void>;
  update(entity: LeaveRequest): Promise<void>;
  delete(entity: LeaveRequest): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<LeaveRequest | null>;
  findByEmploymentId(tenantId: Identifier, employmentId: Identifier): Promise<LeaveRequest[]>;
  findAll(tenantId: Identifier): Promise<LeaveRequest[]>;
}
