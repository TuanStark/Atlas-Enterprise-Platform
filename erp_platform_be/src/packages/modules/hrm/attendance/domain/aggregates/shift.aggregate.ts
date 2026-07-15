import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface ShiftProps {
  tenantId: Identifier;
  code: string;
  name: string;
  startTime: Date;
  endTime: Date;
  breakMinutes: number;
  isFlexible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Shift extends AggregateRoot<ShiftProps> {
  static create(
    props: Omit<ShiftProps, 'createdAt' | 'updatedAt' | 'breakMinutes' | 'isFlexible'> & {
      breakMinutes?: number;
      isFlexible?: boolean;
    },
  ): Shift {
    const now = new Date();
    return new Shift(Identifier.create(), {
      ...props,
      breakMinutes: props.breakMinutes ?? 60,
      isFlexible: props.isFlexible ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: ShiftProps): Shift {
    return new Shift(id, props);
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

  get startTime() {
    return this.props.startTime;
  }

  get endTime() {
    return this.props.endTime;
  }

  get breakMinutes() {
    return this.props.breakMinutes;
  }

  get isFlexible() {
    return this.props.isFlexible;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(
    name: string,
    startTime: Date,
    endTime: Date,
    breakMinutes?: number,
    isFlexible?: boolean,
  ) {
    this.props.name = name;
    this.props.startTime = startTime;
    this.props.endTime = endTime;
    if (breakMinutes !== undefined) {
      this.props.breakMinutes = breakMinutes;
    }
    if (isFlexible !== undefined) {
      this.props.isFlexible = isFlexible;
    }
    this.props.updatedAt = new Date();
  }
}
