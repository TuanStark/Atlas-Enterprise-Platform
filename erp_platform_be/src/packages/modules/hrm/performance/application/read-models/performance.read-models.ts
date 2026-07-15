import { ReviewStatus } from '@prisma/client';

export interface PerformanceCycleReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceRatingReadModel {
  id: string;
  tenantId: string;
  code?: string;
  name?: string;
  score?: number;
  description?: string;
  createdAt: Date;
}

export interface PerformanceGoalProgressReadModel {
  id: string;
  goalId: string;
  progress?: number;
  note?: string;
  updatedByPrincipalId?: string;
  updatedAt: Date;
}

export interface PerformanceGoalReadModel {
  id: string;
  tenantId: string;
  employmentId: string;
  performanceCycleId: string;
  title?: string;
  description?: string;
  targetValue?: number;
  weight?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  progresses: PerformanceGoalProgressReadModel[];
}

export interface PerformanceReviewItemReadModel {
  id: string;
  performanceReviewId: string;
  goalId?: string;
  criteria?: string;
  ratingId?: string;
  score?: number;
  comment?: string;
}

export interface PerformanceReviewReadModel {
  id: string;
  tenantId: string;
  employmentId: string;
  reviewerEmploymentId?: string;
  performanceCycleId: string;
  workflowInstanceId?: string;
  overallRatingId?: string;
  overallScore?: number;
  status: ReviewStatus;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewItems: PerformanceReviewItemReadModel[];
}
