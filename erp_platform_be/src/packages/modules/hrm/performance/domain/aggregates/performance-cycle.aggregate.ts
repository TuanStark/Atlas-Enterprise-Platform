import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface PerformanceCycleProps {
  tenantId: Identifier;
  code: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PerformanceCycle extends AggregateRoot<PerformanceCycleProps> {
  static create(
    props: Omit<PerformanceCycleProps, 'createdAt' | 'updatedAt' | 'isActive'> & {
      isActive?: boolean;
    },
  ): PerformanceCycle {
    const now = new Date();
    return new PerformanceCycle(Identifier.create(), {
      ...props,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: PerformanceCycleProps): PerformanceCycle {
    return new PerformanceCycle(id, props);
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

  get startDate() {
    return this.props.startDate;
  }

  get endDate() {
    return this.props.endDate;
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

  update(
    props: Partial<Omit<PerformanceCycleProps, 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): void {
    if (props.code !== undefined) this.props.code = props.code;
    if (props.name !== undefined) this.props.name = props.name;
    if (props.startDate !== undefined) this.props.startDate = props.startDate;
    if (props.endDate !== undefined) this.props.endDate = props.endDate;
    if (props.isActive !== undefined) this.props.isActive = props.isActive;
    this.props.updatedAt = new Date();
  }
}
