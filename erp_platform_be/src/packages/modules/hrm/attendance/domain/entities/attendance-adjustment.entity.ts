import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface AttendanceAdjustmentProps {
  attendanceRecordId: Identifier;
  requestedByPrincipalId?: string;
  approvedByPrincipalId?: string;
  reason?: string;
  oldCheckIn?: Date;
  newCheckIn?: Date;
  oldCheckOut?: Date;
  newCheckOut?: Date;
  createdAt: Date;
}

export class AttendanceAdjustment extends Entity<AttendanceAdjustmentProps> {
  static create(props: Omit<AttendanceAdjustmentProps, 'createdAt'>): AttendanceAdjustment {
    return new AttendanceAdjustment(Identifier.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: AttendanceAdjustmentProps): AttendanceAdjustment {
    return new AttendanceAdjustment(id, props);
  }

  get attendanceRecordId() {
    return this.props.attendanceRecordId;
  }

  get requestedByPrincipalId() {
    return this.props.requestedByPrincipalId;
  }

  get approvedByPrincipalId() {
    return this.props.approvedByPrincipalId;
  }

  get reason() {
    return this.props.reason;
  }

  get oldCheckIn() {
    return this.props.oldCheckIn;
  }

  get newCheckIn() {
    return this.props.newCheckIn;
  }

  get oldCheckOut() {
    return this.props.oldCheckOut;
  }

  get newCheckOut() {
    return this.props.newCheckOut;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  approve(approvedByPrincipalId: string) {
    this.props.approvedByPrincipalId = approvedByPrincipalId;
  }

  reject(approvedByPrincipalId: string) {
    // If rejected, we don't apply hours, but we set the reviewer ID and append to reason
    this.props.approvedByPrincipalId = approvedByPrincipalId;
    this.props.reason = `[REJECTED] ${this.props.reason || ''}`;
  }
}
