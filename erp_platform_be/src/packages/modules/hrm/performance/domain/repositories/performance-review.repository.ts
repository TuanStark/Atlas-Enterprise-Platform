import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceReview } from '../aggregates/performance-review.aggregate';

export const PERFORMANCE_REVIEW_REPOSITORY = Symbol('PERFORMANCE_REVIEW_REPOSITORY');

export interface PerformanceReviewRepository {
  save(entity: PerformanceReview): Promise<void>;
  update(entity: PerformanceReview): Promise<void>;
  delete(entity: PerformanceReview): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<PerformanceReview | null>;
  findByEmploymentId(tenantId: Identifier, employmentId: Identifier): Promise<PerformanceReview[]>;
  findAll(tenantId: Identifier): Promise<PerformanceReview[]>;
}
