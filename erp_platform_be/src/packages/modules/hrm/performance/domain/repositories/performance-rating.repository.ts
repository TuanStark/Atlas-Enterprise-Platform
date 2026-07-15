import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceRating } from '../aggregates/performance-rating.aggregate';

export const PERFORMANCE_RATING_REPOSITORY = Symbol('PERFORMANCE_RATING_REPOSITORY');

export interface PerformanceRatingRepository {
  save(entity: PerformanceRating): Promise<void>;
  update(entity: PerformanceRating): Promise<void>;
  delete(entity: PerformanceRating): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<PerformanceRating | null>;
  findAll(tenantId: Identifier): Promise<PerformanceRating[]>;
}
