import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PerformanceGoalProgress } from '../entities/performance-goal-progress.entity';

export interface PerformanceGoalProps {
  tenantId: Identifier;
  employmentId: Identifier;
  performanceCycleId: Identifier;
  title?: string;
  description?: string;
  targetValue?: number;
  weight?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  progresses: PerformanceGoalProgress[];
}

export class PerformanceGoal extends AggregateRoot<PerformanceGoalProps> {
  static create(
    props: Omit<PerformanceGoalProps, 'createdAt' | 'updatedAt' | 'progresses'> & {
      progresses?: PerformanceGoalProgress[];
    },
  ): PerformanceGoal {
    const now = new Date();
    return new PerformanceGoal(Identifier.create(), {
      ...props,
      progresses: props.progresses ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: PerformanceGoalProps): PerformanceGoal {
    return new PerformanceGoal(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get performanceCycleId() {
    return this.props.performanceCycleId;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get targetValue() {
    return this.props.targetValue;
  }

  get weight() {
    return this.props.weight;
  }

  get dueDate() {
    return this.props.dueDate;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get progresses() {
    return this.props.progresses;
  }

  addProgress(progress: PerformanceGoalProgress): void {
    this.props.progresses.push(progress);
    this.props.updatedAt = new Date();
  }

  update(
    props: Partial<
      Omit<
        PerformanceGoalProps,
        | 'tenantId'
        | 'employmentId'
        | 'performanceCycleId'
        | 'progresses'
        | 'createdAt'
        | 'updatedAt'
      >
    >,
  ): void {
    if (props.title !== undefined) this.props.title = props.title;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.targetValue !== undefined) this.props.targetValue = props.targetValue;
    if (props.weight !== undefined) this.props.weight = props.weight;
    if (props.dueDate !== undefined) this.props.dueDate = props.dueDate;
    this.props.updatedAt = new Date();
  }
}
