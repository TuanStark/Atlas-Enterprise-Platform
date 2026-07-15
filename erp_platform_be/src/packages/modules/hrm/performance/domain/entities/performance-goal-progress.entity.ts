import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface PerformanceGoalProgressProps {
  goalId: Identifier;
  progress?: number;
  note?: string;
  updatedByPrincipalId?: Identifier;
  updatedAt: Date;
}

export class PerformanceGoalProgress extends Entity<PerformanceGoalProgressProps> {
  static create(
    props: Omit<PerformanceGoalProgressProps, 'updatedAt'> & { updatedAt?: Date },
  ): PerformanceGoalProgress {
    return new PerformanceGoalProgress(Identifier.create(), {
      ...props,
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  static rehydrate(id: Identifier, props: PerformanceGoalProgressProps): PerformanceGoalProgress {
    return new PerformanceGoalProgress(id, props);
  }

  get goalId() {
    return this.props.goalId;
  }

  get progress() {
    return this.props.progress;
  }

  get note() {
    return this.props.note;
  }

  get updatedByPrincipalId() {
    return this.props.updatedByPrincipalId;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(props: Partial<Omit<PerformanceGoalProgressProps, 'goalId' | 'updatedAt'>>): void {
    if (props.progress !== undefined) this.props.progress = props.progress;
    if (props.note !== undefined) this.props.note = props.note;
    if (props.updatedByPrincipalId !== undefined)
      this.props.updatedByPrincipalId = props.updatedByPrincipalId;
    this.props.updatedAt = new Date();
  }
}
