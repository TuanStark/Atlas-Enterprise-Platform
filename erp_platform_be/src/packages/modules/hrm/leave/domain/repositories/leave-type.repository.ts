import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveType } from '../aggregates/leave-type.aggregate';

export const LEAVE_TYPE_REPOSITORY = Symbol('LEAVE_TYPE_REPOSITORY');

export interface LeaveTypeRepository {
  save(entity: LeaveType): Promise<void>;
  update(entity: LeaveType): Promise<void>;
  delete(entity: LeaveType): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<LeaveType | null>;
  findByCode(tenantId: Identifier, code: string): Promise<LeaveType | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<LeaveType[]>;
}
