import { PerformanceCycle } from '../../domain/aggregates/performance-cycle.aggregate';
import { PerformanceRating } from '../../domain/aggregates/performance-rating.aggregate';
import { PerformanceGoal } from '../../domain/aggregates/performance-goal.aggregate';
import { PerformanceReview } from '../../domain/aggregates/performance-review.aggregate';
import {
  PerformanceCycleReadModel,
  PerformanceRatingReadModel,
  PerformanceGoalReadModel,
  PerformanceReviewReadModel,
} from '../read-models/performance.read-models';

export class PerformanceReadModelMappers {
  static toPerformanceCycleReadModel(entity: PerformanceCycle): PerformanceCycleReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      startDate: entity.startDate,
      endDate: entity.endDate,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPerformanceRatingReadModel(entity: PerformanceRating): PerformanceRatingReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      score: entity.score,
      description: entity.description,
      createdAt: entity.createdAt,
    };
  }

  static toPerformanceGoalReadModel(entity: PerformanceGoal): PerformanceGoalReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      performanceCycleId: entity.performanceCycleId.toString(),
      title: entity.title,
      description: entity.description,
      targetValue: entity.targetValue,
      weight: entity.weight,
      dueDate: entity.dueDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      progresses: entity.progresses.map((p) => ({
        id: p.id.toString(),
        goalId: p.goalId.toString(),
        progress: p.progress,
        note: p.note,
        updatedByPrincipalId: p.updatedByPrincipalId
          ? p.updatedByPrincipalId.toString()
          : undefined,
        updatedAt: p.updatedAt,
      })),
    };
  }

  static toPerformanceReviewReadModel(entity: PerformanceReview): PerformanceReviewReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      reviewerEmploymentId: entity.reviewerEmploymentId
        ? entity.reviewerEmploymentId.toString()
        : undefined,
      performanceCycleId: entity.performanceCycleId.toString(),
      workflowInstanceId: entity.workflowInstanceId
        ? entity.workflowInstanceId.toString()
        : undefined,
      overallRatingId: entity.overallRatingId ? entity.overallRatingId.toString() : undefined,
      overallScore: entity.overallScore,
      status: entity.status,
      comment: entity.comment,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      reviewItems: entity.reviewItems.map((ri) => ({
        id: ri.id.toString(),
        performanceReviewId: ri.performanceReviewId.toString(),
        goalId: ri.goalId ? ri.goalId.toString() : undefined,
        criteria: ri.criteria,
        ratingId: ri.ratingId ? ri.ratingId.toString() : undefined,
        score: ri.score,
        comment: ri.comment,
      })),
    };
  }
}
