import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ShiftAssignment } from '../entities/shift-assignment.entity';

export const SHIFT_ASSIGNMENT_REPOSITORY = Symbol('SHIFT_ASSIGNMENT_REPOSITORY');

export interface ShiftAssignmentRepository {
  save(entity: ShiftAssignment): Promise<void>;
  update(entity: ShiftAssignment): Promise<void>;
  delete(entity: ShiftAssignment): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<ShiftAssignment | null>;
  findByEmploymentId(tenantId: Identifier, employmentId: Identifier): Promise<ShiftAssignment[]>;
  findActiveByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
    date: Date,
  ): Promise<ShiftAssignment | null>;
  findAll(tenantId: Identifier): Promise<ShiftAssignment[]>;
}
