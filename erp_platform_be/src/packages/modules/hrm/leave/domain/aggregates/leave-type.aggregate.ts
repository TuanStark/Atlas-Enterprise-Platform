import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface LeaveTypeProps {
  tenantId: Identifier;
  code: string;
  name: string;
  isPaid: boolean;
  requiresAttachment: boolean;
  color?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class LeaveType extends AggregateRoot<LeaveTypeProps> {
  static create(
    props: Omit<LeaveTypeProps, 'createdAt' | 'updatedAt' | 'isPaid' | 'requiresAttachment'> & {
      isPaid?: boolean;
      requiresAttachment?: boolean;
    },
  ): LeaveType {
    const now = new Date();
    return new LeaveType(Identifier.create(), {
      ...props,
      isPaid: props.isPaid ?? true,
      requiresAttachment: props.requiresAttachment ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: LeaveTypeProps): LeaveType {
    return new LeaveType(id, props);
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

  get isPaid() {
    return this.props.isPaid;
  }

  get requiresAttachment() {
    return this.props.requiresAttachment;
  }

  get color() {
    return this.props.color;
  }

  get description() {
    return this.props.description;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(
    name: string,
    isPaid?: boolean,
    requiresAttachment?: boolean,
    color?: string,
    description?: string,
  ) {
    this.props.name = name;
    if (isPaid !== undefined) {
      this.props.isPaid = isPaid;
    }
    if (requiresAttachment !== undefined) {
      this.props.requiresAttachment = requiresAttachment;
    }
    this.props.color = color;
    this.props.description = description;
    this.props.updatedAt = new Date();
  }
}
