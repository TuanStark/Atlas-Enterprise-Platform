import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Shift } from '../aggregates/shift.aggregate';

export const SHIFT_REPOSITORY = Symbol('SHIFT_REPOSITORY');

export interface ShiftRepository {
  save(entity: Shift): Promise<void>;
  update(entity: Shift): Promise<void>;
  delete(entity: Shift): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<Shift | null>;
  findByCode(tenantId: Identifier, code: string): Promise<Shift | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<Shift[]>;
}
