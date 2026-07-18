import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AttendanceStatus, AttendanceSource } from '@prisma/client';
import { AttendanceAdjustment } from '../entities/attendance-adjustment.entity';
// import { AttendanceAdjustment } from '../entities/attendance-adjustment.entity';

export interface AttendanceRecordProps {
  tenantId: Identifier;
  employmentId: Identifier;
  shiftAssignmentId?: Identifier;
  attendanceDate: Date;
  checkInAt?: Date;
  checkOutAt?: Date;
  workedMinutes?: number;
  overtimeMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  status?: AttendanceStatus;
  source?: AttendanceSource;
  deviceId?: string;
  metadata?: Record<string, unknown>;
  adjustments: AttendanceAdjustment[];
  createdAt: Date;
  updatedAt: Date;
  employment?: {
    id: string;
    employee?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

export class AttendanceRecord extends AggregateRoot<AttendanceRecordProps> {
  static create(props: {
    tenantId: Identifier;
    employmentId: Identifier;
    shiftAssignmentId?: Identifier;
    attendanceDate: Date;
    checkInAt?: Date;
    checkOutAt?: Date;
    source?: AttendanceSource;
    deviceId?: string;
  }): AttendanceRecord {
    const now = new Date();
    const normalizedDate = new Date(props.attendanceDate);
    normalizedDate.setHours(0, 0, 0, 0);

    return new AttendanceRecord(Identifier.create(), {
      ...props,
      attendanceDate: normalizedDate,
      overtimeMinutes: 0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      adjustments: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: AttendanceRecordProps): AttendanceRecord {
    return new AttendanceRecord(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get shiftAssignmentId() {
    return this.props.shiftAssignmentId;
  }

  get attendanceDate() {
    return this.props.attendanceDate;
  }

  get checkInAt() {
    return this.props.checkInAt;
  }

  get checkOutAt() {
    return this.props.checkOutAt;
  }

  get workedMinutes() {
    return this.props.workedMinutes;
  }

  get overtimeMinutes() {
    return this.props.overtimeMinutes;
  }

  get lateMinutes() {
    return this.props.lateMinutes;
  }

  get earlyLeaveMinutes() {
    return this.props.earlyLeaveMinutes;
  }

  get status() {
    return this.props.status;
  }

  get source() {
    return this.props.source;
  }

  get deviceId() {
    return this.props.deviceId;
  }

  get metadata() {
    return this.props.metadata;
  }

  get adjustments(): readonly AttendanceAdjustment[] {
    return this.props.adjustments;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get employment() {
    return this.props.employment;
  }

  // --- Domain Commands ---

  checkIn(checkInAt: Date, source: AttendanceSource, deviceId?: string) {
    this.props.checkInAt = checkInAt;
    this.props.source = source;
    this.props.deviceId = deviceId;
    this.touch();
  }

  checkOut(checkOutAt: Date) {
    this.props.checkOutAt = checkOutAt;
    this.touch();
  }

  updateCalculations(calculations: {
    workedMinutes: number;
    lateMinutes: number;
    earlyLeaveMinutes: number;
    overtimeMinutes: number;
    status: AttendanceStatus;
  }) {
    this.props.workedMinutes = calculations.workedMinutes;
    this.props.lateMinutes = calculations.lateMinutes;
    this.props.earlyLeaveMinutes = calculations.earlyLeaveMinutes;
    this.props.overtimeMinutes = calculations.overtimeMinutes;
    this.props.status = calculations.status;
    this.touch();
  }

  // --- Adjustments ---

  requestAdjustment(
    requestedByPrincipalId: string,
    reason: string,
    newCheckIn?: Date,
    newCheckOut?: Date,
  ): AttendanceAdjustment {
    const adjustment = AttendanceAdjustment.create({
      attendanceRecordId: this.id,
      requestedByPrincipalId,
      reason,
      oldCheckIn: this.props.checkInAt,
      newCheckIn,
      oldCheckOut: this.props.checkOutAt,
      newCheckOut,
    });
    this.props.adjustments.push(adjustment);
    this.touch();
    return adjustment;
  }

  approveAdjustment(adjustmentId: Identifier, approvedByPrincipalId: string) {
    const adj = this.props.adjustments.find((a) => a.id.equals(adjustmentId));
    if (!adj) {
      throw new Error(`Adjustment not found: ${adjustmentId}`);
    }

    adj.approve(approvedByPrincipalId);

    // Apply the adjustment hours to the record
    if (adj.newCheckIn !== undefined) {
      this.props.checkInAt = adj.newCheckIn ?? undefined;
    }
    if (adj.newCheckOut !== undefined) {
      this.props.checkOutAt = adj.newCheckOut ?? undefined;
    }

    this.touch();
  }

  rejectAdjustment(adjustmentId: Identifier, approvedByPrincipalId: string) {
    const adj = this.props.adjustments.find((a) => a.id.equals(adjustmentId));
    if (!adj) {
      throw new Error(`Adjustment not found: ${adjustmentId}`);
    }
    adj.reject(approvedByPrincipalId);
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
