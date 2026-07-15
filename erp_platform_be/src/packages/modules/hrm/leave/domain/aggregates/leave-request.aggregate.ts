import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LeaveRequestStatus } from '@prisma/client';

export interface LeaveRequestProps {
  tenantId: Identifier;
  employmentId: Identifier;
  leaveTypeId: Identifier;
  workflowInstanceId?: Identifier;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  status: LeaveRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class LeaveRequest extends AggregateRoot<LeaveRequestProps> {
  static create(
    props: Omit<LeaveRequestProps, 'createdAt' | 'updatedAt' | 'status'> & {
      status?: LeaveRequestStatus;
    },
  ): LeaveRequest {
    const now = new Date();
    return new LeaveRequest(Identifier.create(), {
      ...props,
      status: props.status ?? LeaveRequestStatus.pending,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: LeaveRequestProps): LeaveRequest {
    return new LeaveRequest(id, props);
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

  get workflowInstanceId() {
    return this.props.workflowInstanceId;
  }

  get startDate() {
    return this.props.startDate;
  }

  get endDate() {
    return this.props.endDate;
  }

  get totalDays() {
    return this.props.totalDays;
  }

  get reason() {
    return this.props.reason;
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

  approve() {
    if (this.props.status !== LeaveRequestStatus.pending) {
      throw new Error(`Cannot approve a leave request in status: ${this.props.status}`);
    }
    this.props.status = LeaveRequestStatus.approved;
    this.props.updatedAt = new Date();
  }

  reject() {
    if (this.props.status !== LeaveRequestStatus.pending) {
      throw new Error(`Cannot reject a leave request in status: ${this.props.status}`);
    }
    this.props.status = LeaveRequestStatus.rejected;
    this.props.updatedAt = new Date();
  }

  cancel() {
    if (
      this.props.status !== LeaveRequestStatus.draft &&
      this.props.status !== LeaveRequestStatus.pending
    ) {
      throw new Error(`Cannot cancel a leave request in status: ${this.props.status}`);
    }
    this.props.status = LeaveRequestStatus.cancelled;
    this.props.updatedAt = new Date();
  }
}
