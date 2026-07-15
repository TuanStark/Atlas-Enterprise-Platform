import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingStatus } from '@prisma/client';

export interface TrainingSessionProps {
  tenantId: Identifier;
  courseId: Identifier;
  instructorEmploymentId?: Identifier;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  capacity?: number;
  status: TrainingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class TrainingSession extends AggregateRoot<TrainingSessionProps> {
  static create(
    props: Omit<TrainingSessionProps, 'createdAt' | 'updatedAt' | 'status'> & {
      status?: TrainingStatus;
    },
  ): TrainingSession {
    const now = new Date();
    return new TrainingSession(Identifier.create(), {
      ...props,
      status: props.status ?? TrainingStatus.planned,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: TrainingSessionProps): TrainingSession {
    return new TrainingSession(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get courseId() {
    return this.props.courseId;
  }

  get instructorEmploymentId() {
    return this.props.instructorEmploymentId;
  }

  get startDate() {
    return this.props.startDate;
  }

  get endDate() {
    return this.props.endDate;
  }

  get location() {
    return this.props.location;
  }

  get capacity() {
    return this.props.capacity;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(
    props: Partial<Omit<TrainingSessionProps, 'tenantId' | 'courseId' | 'createdAt' | 'updatedAt'>>,
  ): void {
    if (props.instructorEmploymentId !== undefined)
      this.props.instructorEmploymentId = props.instructorEmploymentId;
    if (props.startDate !== undefined) this.props.startDate = props.startDate;
    if (props.endDate !== undefined) this.props.endDate = props.endDate;
    if (props.location !== undefined) this.props.location = props.location;
    if (props.capacity !== undefined) this.props.capacity = props.capacity;
    if (props.status !== undefined) this.props.status = props.status;
    this.props.updatedAt = new Date();
  }
}
