import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface LeaveBalanceProps {
  tenantId: Identifier;
  employmentId: Identifier;
  leaveTypeId: Identifier;
  leaveYear: number;
  entitledDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  updatedAt: Date;
}

export class LeaveBalance extends AggregateRoot<LeaveBalanceProps> {
  static create(props: {
    tenantId: Identifier;
    employmentId: Identifier;
    leaveTypeId: Identifier;
    leaveYear: number;
    entitledDays: number;
  }): LeaveBalance {
    return new LeaveBalance(Identifier.create(), {
      ...props,
      usedDays: 0,
      pendingDays: 0,
      remainingDays: props.entitledDays,
      updatedAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: LeaveBalanceProps): LeaveBalance {
    return new LeaveBalance(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get leaveTypeId() {
    return this.props.leaveTypeId;
  }

  get leaveYear() {
    return this.props.leaveYear;
  }

  get entitledDays() {
    return this.props.entitledDays;
  }

  get usedDays() {
    return this.props.usedDays;
  }

  get pendingDays() {
    return this.props.pendingDays;
  }

  get remainingDays() {
    return this.props.remainingDays;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  // --- Domain Logic ---

  updateEntitlement(entitledDays: number) {
    this.props.entitledDays = entitledDays;
    this.recalculateRemaining();
  }

  requestDays(days: number) {
    this.props.pendingDays += days;
    this.touch();
  }

  approveDays(days: number) {
    this.props.pendingDays = Math.max(0, this.props.pendingDays - days);
    this.props.usedDays += days;
    this.recalculateRemaining();
  }

  rejectDays(days: number) {
    this.props.pendingDays = Math.max(0, this.props.pendingDays - days);
    this.touch();
  }

  cancelApprovedDays(days: number) {
    this.props.usedDays = Math.max(0, this.props.usedDays - days);
    this.recalculateRemaining();
  }

  private recalculateRemaining() {
    this.props.remainingDays = this.props.entitledDays - this.props.usedDays;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
