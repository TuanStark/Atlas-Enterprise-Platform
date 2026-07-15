import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceCycle } from '../aggregates/performance-cycle.aggregate';

export const PERFORMANCE_CYCLE_REPOSITORY = Symbol('PERFORMANCE_CYCLE_REPOSITORY');

export interface PerformanceCycleRepository {
  save(entity: PerformanceCycle): Promise<void>;
  update(entity: PerformanceCycle): Promise<void>;
  delete(entity: PerformanceCycle): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<PerformanceCycle | null>;
  findByCode(tenantId: Identifier, code: string): Promise<PerformanceCycle | null>;
  existsByCode(tenantId: Identifier, code: string): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<PerformanceCycle[]>;
}
