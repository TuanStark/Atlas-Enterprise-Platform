import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface LeaveTransactionProps {
  tenantId: Identifier;
  leaveBalanceId: Identifier;
  leaveRequestId?: Identifier;
  transactionType: string; // 'deduct', 'carry_forward', 'accrual'
  days: number;
  description?: string;
  createdAt: Date;
}

export class LeaveTransaction extends Entity<LeaveTransactionProps> {
  static create(props: Omit<LeaveTransactionProps, 'createdAt'>): LeaveTransaction {
    return new LeaveTransaction(Identifier.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: LeaveTransactionProps): LeaveTransaction {
    return new LeaveTransaction(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get leaveBalanceId() {
    return this.props.leaveBalanceId;
  }

  get leaveRequestId() {
    return this.props.leaveRequestId;
  }

  get transactionType() {
    return this.props.transactionType;
  }

  get days() {
    return this.props.days;
  }

  get description() {
    return this.props.description;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
