import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface PerformanceRatingProps {
  tenantId: Identifier;
  code?: string;
  name?: string;
  score?: number;
  description?: string;
  createdAt: Date;
}

export class PerformanceRating extends AggregateRoot<PerformanceRatingProps> {
  static create(props: Omit<PerformanceRatingProps, 'createdAt'>): PerformanceRating {
    return new PerformanceRating(Identifier.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: PerformanceRatingProps): PerformanceRating {
    return new PerformanceRating(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get code() {
    return this.props.code;
  }

  get name() {
    return this.props.name;
  }

  get score() {
    return this.props.score;
  }

  get description() {
    return this.props.description;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  update(props: Partial<Omit<PerformanceRatingProps, 'tenantId' | 'createdAt'>>): void {
    if (props.code !== undefined) this.props.code = props.code;
    if (props.name !== undefined) this.props.name = props.name;
    if (props.score !== undefined) this.props.score = props.score;
    if (props.description !== undefined) this.props.description = props.description;
  }
}
