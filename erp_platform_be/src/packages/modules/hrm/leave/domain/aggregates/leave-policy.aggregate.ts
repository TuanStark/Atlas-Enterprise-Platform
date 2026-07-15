import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface LeavePolicyProps {
  tenantId: Identifier;
  leaveTypeId: Identifier;
  employmentTypeId?: Identifier;
  annualDays: number;
  maxConsecutiveDays?: number;
  carryForwardLimit?: number;
  requiresApproval: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class LeavePolicy extends AggregateRoot<LeavePolicyProps> {
  static create(
    props: Omit<LeavePolicyProps, 'createdAt' | 'updatedAt' | 'requiresApproval' | 'annualDays'> & {
      annualDays?: number;
      requiresApproval?: boolean;
    },
  ): LeavePolicy {
    const now = new Date();
    return new LeavePolicy(Identifier.create(), {
      ...props,
      annualDays: props.annualDays ?? 12,
      requiresApproval: props.requiresApproval ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: LeavePolicyProps): LeavePolicy {
    return new LeavePolicy(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get leaveTypeId() {
    return this.props.leaveTypeId;
  }

  get employmentTypeId() {
    return this.props.employmentTypeId;
  }

  get annualDays() {
    return this.props.annualDays;
  }

  get maxConsecutiveDays() {
    return this.props.maxConsecutiveDays;
  }

  get carryForwardLimit() {
    return this.props.carryForwardLimit;
  }

  get requiresApproval() {
    return this.props.requiresApproval;
  }

  get effectiveFrom() {
    return this.props.effectiveFrom;
  }

  get effectiveTo() {
    return this.props.effectiveTo;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(
    annualDays: number,
    maxConsecutiveDays?: number,
    carryForwardLimit?: number,
    requiresApproval?: boolean,
    effectiveFrom?: Date,
    effectiveTo?: Date,
  ) {
    this.props.annualDays = annualDays;
    this.props.maxConsecutiveDays = maxConsecutiveDays;
    this.props.carryForwardLimit = carryForwardLimit;
    if (requiresApproval !== undefined) {
      this.props.requiresApproval = requiresApproval;
    }
    this.props.effectiveFrom = effectiveFrom;
    this.props.effectiveTo = effectiveTo;
    this.props.updatedAt = new Date();
  }
}
