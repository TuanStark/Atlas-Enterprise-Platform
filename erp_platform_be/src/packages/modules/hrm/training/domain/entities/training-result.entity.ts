import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface TrainingResultProps {
  enrollmentId: Identifier;
  score?: number;
  passed?: boolean;
  feedback?: string;
  evaluatedByEmploymentId?: Identifier;
  evaluatedAt?: Date;
}

export class TrainingResult extends Entity<TrainingResultProps> {
  static create(props: TrainingResultProps): TrainingResult {
    return new TrainingResult(Identifier.create(), props);
  }

  static rehydrate(id: Identifier, props: TrainingResultProps): TrainingResult {
    return new TrainingResult(id, props);
  }

  get enrollmentId() {
    return this.props.enrollmentId;
  }

  get score() {
    return this.props.score;
  }

  get passed() {
    return this.props.passed;
  }

  get feedback() {
    return this.props.feedback;
  }

  get evaluatedByEmploymentId() {
    return this.props.evaluatedByEmploymentId;
  }

  get evaluatedAt() {
    return this.props.evaluatedAt;
  }

  update(props: Partial<Omit<TrainingResultProps, 'enrollmentId'>>): void {
    if (props.score !== undefined) this.props.score = props.score;
    if (props.passed !== undefined) this.props.passed = props.passed;
    if (props.feedback !== undefined) this.props.feedback = props.feedback;
    if (props.evaluatedByEmploymentId !== undefined)
      this.props.evaluatedByEmploymentId = props.evaluatedByEmploymentId;
    if (props.evaluatedAt !== undefined) this.props.evaluatedAt = props.evaluatedAt;
  }
}
