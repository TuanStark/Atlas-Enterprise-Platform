import {
  PerformanceReview as PrismaPerformanceReview,
  PerformanceReviewItem as PrismaReviewItem,
  Prisma,
  ReviewStatus,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceReview } from '../../domain/aggregates/performance-review.aggregate';
import { PerformanceReviewItem } from '../../domain/entities/performance-review-item.entity';

export type PrismaPerformanceReviewPayload = PrismaPerformanceReview & {
  performanceReviewPerformanceReviewItems?: PrismaReviewItem[];
};

export class PerformanceReviewPersistenceMapper {
  static toDomain(prisma: PrismaPerformanceReviewPayload): PerformanceReview {
    const reviewId = Identifier.create(prisma.id);

    return PerformanceReview.rehydrate(reviewId, {
      tenantId: Identifier.create(prisma.tenantId),
      employmentId: Identifier.create(prisma.employmentId),
      reviewerEmploymentId: prisma.reviewerEmploymentId
        ? Identifier.create(prisma.reviewerEmploymentId)
        : undefined,
      performanceCycleId: Identifier.create(prisma.performanceCycleId),
      workflowInstanceId: prisma.workflowInstanceId
        ? Identifier.create(prisma.workflowInstanceId)
        : undefined,
      overallRatingId: prisma.overallRatingId
        ? Identifier.create(prisma.overallRatingId)
        : undefined,
      overallScore: prisma.overallScore ? prisma.overallScore.toNumber() : undefined,
      status: prisma.status ?? ReviewStatus.draft,
      comment: prisma.comment ?? undefined,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
      reviewItems: (prisma.performanceReviewPerformanceReviewItems ?? []).map((ri) =>
        PerformanceReviewItem.rehydrate(Identifier.create(ri.id), {
          performanceReviewId: reviewId,
          goalId: ri.goalId ? Identifier.create(ri.goalId) : undefined,
          criteria: ri.criteria ?? undefined,
          ratingId: ri.ratingId ? Identifier.create(ri.ratingId) : undefined,
          score: ri.score ? ri.score.toNumber() : undefined,
          comment: ri.comment ?? undefined,
        }),
      ),
    });
  }

  static toPersistence(entity: PerformanceReview): PrismaPerformanceReview {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      reviewerEmploymentId: entity.reviewerEmploymentId
        ? entity.reviewerEmploymentId.toString()
        : null,
      performanceCycleId: entity.performanceCycleId.toString(),
      workflowInstanceId: entity.workflowInstanceId ? entity.workflowInstanceId.toString() : null,
      overallRatingId: entity.overallRatingId ? entity.overallRatingId.toString() : null,
      overallScore:
        entity.overallScore !== undefined ? new Prisma.Decimal(entity.overallScore) : null,
      status: entity.status,
      comment: entity.comment ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
