import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ReviewStatus } from '@prisma/client';
import { PerformanceReviewItem } from '../entities/performance-review-item.entity';

export interface PerformanceReviewProps {
  tenantId: Identifier;
  employmentId: Identifier;
  reviewerEmploymentId?: Identifier;
  performanceCycleId: Identifier;
  workflowInstanceId?: Identifier;
  overallRatingId?: Identifier;
  overallScore?: number;
  status: ReviewStatus;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewItems: PerformanceReviewItem[];
}

export class PerformanceReview extends AggregateRoot<PerformanceReviewProps> {
  static create(
    props: Omit<PerformanceReviewProps, 'createdAt' | 'updatedAt' | 'status' | 'reviewItems'> & {
      status?: ReviewStatus;
      reviewItems?: PerformanceReviewItem[];
    },
  ): PerformanceReview {
    const now = new Date();
    return new PerformanceReview(Identifier.create(), {
      ...props,
      reviewItems: props.reviewItems ?? [],
      status: props.status ?? ReviewStatus.draft,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: PerformanceReviewProps): PerformanceReview {
    return new PerformanceReview(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get reviewerEmploymentId() {
    return this.props.reviewerEmploymentId;
  }

  get performanceCycleId() {
    return this.props.performanceCycleId;
  }

  get workflowInstanceId() {
    return this.props.workflowInstanceId;
  }

  get overallRatingId() {
    return this.props.overallRatingId;
  }

  get overallScore() {
    return this.props.overallScore;
  }

  get status() {
    return this.props.status;
  }

  get comment() {
    return this.props.comment;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get reviewItems() {
    return this.props.reviewItems;
  }

  addReviewItem(item: PerformanceReviewItem): void {
    this.props.reviewItems.push(item);
    this.props.updatedAt = new Date();
  }

  setReviewItems(items: PerformanceReviewItem[]): void {
    this.props.reviewItems = items;
    this.props.updatedAt = new Date();
  }

  update(
    props: Partial<
      Omit<
        PerformanceReviewProps,
        | 'tenantId'
        | 'employmentId'
        | 'performanceCycleId'
        | 'reviewItems'
        | 'createdAt'
        | 'updatedAt'
      >
    >,
  ): void {
    if (props.reviewerEmploymentId !== undefined)
      this.props.reviewerEmploymentId = props.reviewerEmploymentId;
    if (props.workflowInstanceId !== undefined)
      this.props.workflowInstanceId = props.workflowInstanceId;
    if (props.overallRatingId !== undefined) this.props.overallRatingId = props.overallRatingId;
    if (props.overallScore !== undefined) this.props.overallScore = props.overallScore;
    if (props.status !== undefined) this.props.status = props.status;
    if (props.comment !== undefined) this.props.comment = props.comment;
    this.props.updatedAt = new Date();
  }
}
