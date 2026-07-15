import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface PerformanceReviewItemProps {
  performanceReviewId: Identifier;
  goalId?: Identifier;
  criteria?: string;
  ratingId?: Identifier;
  score?: number;
  comment?: string;
}

export class PerformanceReviewItem extends Entity<PerformanceReviewItemProps> {
  static create(props: PerformanceReviewItemProps): PerformanceReviewItem {
    return new PerformanceReviewItem(Identifier.create(), props);
  }

  static rehydrate(id: Identifier, props: PerformanceReviewItemProps): PerformanceReviewItem {
    return new PerformanceReviewItem(id, props);
  }

  get performanceReviewId() {
    return this.props.performanceReviewId;
  }

  get goalId() {
    return this.props.goalId;
  }

  get criteria() {
    return this.props.criteria;
  }

  get ratingId() {
    return this.props.ratingId;
  }

  get score() {
    return this.props.score;
  }

  get comment() {
    return this.props.comment;
  }

  update(props: Partial<Omit<PerformanceReviewItemProps, 'performanceReviewId'>>): void {
    if (props.goalId !== undefined) this.props.goalId = props.goalId;
    if (props.criteria !== undefined) this.props.criteria = props.criteria;
    if (props.ratingId !== undefined) this.props.ratingId = props.ratingId;
    if (props.score !== undefined) this.props.score = props.score;
    if (props.comment !== undefined) this.props.comment = props.comment;
  }
}
