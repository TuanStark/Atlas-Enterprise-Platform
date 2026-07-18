import { AttendanceStatus, AttendanceSource } from '@prisma/client';

export interface AttendanceRecordReadModel {
  id: string;
  tenantId: string;
  employmentId: string;
  shiftAssignmentId?: string;
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
  adjustments: AttendanceAdjustmentReadModel[];
  createdAt: Date;
  updatedAt: Date;
  employment?: {
    id: string;
    employee?: {
      id: string;
      firstName: string;
      lastName: string;
      displayName: string;
    };
  };
}

export interface AttendanceAdjustmentReadModel {
  id: string;
  attendanceRecordId: string;
  requestedByPrincipalId?: string;
  approvedByPrincipalId?: string;
  reason?: string;
  oldCheckIn?: Date;
  newCheckIn?: Date;
  oldCheckOut?: Date;
  newCheckOut?: Date;
  createdAt: Date;
}
