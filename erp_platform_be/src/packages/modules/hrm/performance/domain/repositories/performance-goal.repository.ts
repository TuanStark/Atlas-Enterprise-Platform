import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceGoal } from '../aggregates/performance-goal.aggregate';

export const PERFORMANCE_GOAL_REPOSITORY = Symbol('PERFORMANCE_GOAL_REPOSITORY');

export interface PerformanceGoalRepository {
  save(entity: PerformanceGoal): Promise<void>;
  update(entity: PerformanceGoal): Promise<void>;
  delete(entity: PerformanceGoal): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<PerformanceGoal | null>;
  findByEmploymentId(tenantId: Identifier, employmentId: Identifier): Promise<PerformanceGoal[]>;
  findAll(tenantId: Identifier): Promise<PerformanceGoal[]>;
}
