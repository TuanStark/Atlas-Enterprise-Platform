import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface ShiftAssignmentProps {
  tenantId: Identifier;
  employmentId: Identifier;
  shiftId: Identifier;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ShiftAssignment extends AggregateRoot<ShiftAssignmentProps> {
  static create(
    props: Omit<ShiftAssignmentProps, 'createdAt' | 'updatedAt' | 'isPrimary'> & {
      isPrimary?: boolean;
    },
  ): ShiftAssignment {
    const now = new Date();
    return new ShiftAssignment(Identifier.create(), {
      ...props,
      isPrimary: props.isPrimary ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: ShiftAssignmentProps): ShiftAssignment {
    return new ShiftAssignment(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get shiftId() {
    return this.props.shiftId;
  }

  get effectiveFrom() {
    return this.props.effectiveFrom;
  }

  get effectiveTo() {
    return this.props.effectiveTo;
  }

  get isPrimary() {
    return this.props.isPrimary;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  endAssignment(effectiveTo: Date) {
    this.props.effectiveTo = effectiveTo;
    this.props.updatedAt = new Date();
  }
}
