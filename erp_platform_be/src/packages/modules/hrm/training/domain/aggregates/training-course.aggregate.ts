import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface TrainingCourseProps {
  tenantId: Identifier;
  code: string;
  name: string;
  category?: string;
  durationHours?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TrainingCourse extends AggregateRoot<TrainingCourseProps> {
  static create(
    props: Omit<TrainingCourseProps, 'createdAt' | 'updatedAt' | 'isActive'> & {
      isActive?: boolean;
    },
  ): TrainingCourse {
    const now = new Date();
    return new TrainingCourse(Identifier.create(), {
      ...props,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: TrainingCourseProps): TrainingCourse {
    return new TrainingCourse(id, props);
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

  get category() {
    return this.props.category;
  }

  get durationHours() {
    return this.props.durationHours;
  }

  get description() {
    return this.props.description;
  }

  get isActive() {
    return this.props.isActive;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(props: Partial<Omit<TrainingCourseProps, 'tenantId' | 'createdAt' | 'updatedAt'>>): void {
    if (props.code !== undefined) this.props.code = props.code;
    if (props.name !== undefined) this.props.name = props.name;
    if (props.category !== undefined) this.props.category = props.category;
    if (props.durationHours !== undefined) this.props.durationHours = props.durationHours;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.isActive !== undefined) this.props.isActive = props.isActive;
    this.props.updatedAt = new Date();
  }
}
