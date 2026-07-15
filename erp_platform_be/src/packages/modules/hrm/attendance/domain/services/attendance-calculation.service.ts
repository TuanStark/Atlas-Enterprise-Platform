import { Injectable } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { Shift } from '../aggregates/shift.aggregate';

export interface CalculationResult {
  workedMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  status: AttendanceStatus;
}

@Injectable()
export class AttendanceCalculationService {
  calculate(
    attendanceDate: Date,
    checkInAt?: Date,
    checkOutAt?: Date,
    shift?: Shift,
  ): CalculationResult {
    // If no check-in and check-out, employee is absent
    if (!checkInAt && !checkOutAt) {
      return {
        workedMinutes: 0,
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        overtimeMinutes: 0,
        status: AttendanceStatus.absent,
      };
    }

    // Default return if no shift is assigned (flexible / manual recording without target)
    if (!shift) {
      let workedMinutes = 0;
      if (checkInAt && checkOutAt) {
        workedMinutes = Math.max(
          0,
          Math.round((checkOutAt.getTime() - checkInAt.getTime()) / 60000),
        );
      }
      return {
        workedMinutes,
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        overtimeMinutes: 0,
        status: AttendanceStatus.present,
      };
    }

    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Align shift times to the attendance date
    const shiftStart = new Date(startOfDay);
    shiftStart.setHours(shift.startTime.getHours(), shift.startTime.getMinutes(), 0, 0);

    const shiftEnd = new Date(startOfDay);
    shiftEnd.setHours(shift.endTime.getHours(), shift.endTime.getMinutes(), 0, 0);

    // If shift ends on next day (night shift)
    if (shiftEnd < shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    let lateMinutes = 0;
    let earlyLeaveMinutes = 0;
    let workedMinutes = 0;
    let overtimeMinutes = 0;

    // Calculate late minutes
    if (checkInAt) {
      if (checkInAt > shiftStart) {
        lateMinutes = Math.max(0, Math.round((checkInAt.getTime() - shiftStart.getTime()) / 60000));
      }
    }

    // Calculate early leave minutes
    if (checkOutAt) {
      if (checkOutAt < shiftEnd) {
        earlyLeaveMinutes = Math.max(
          0,
          Math.round((shiftEnd.getTime() - checkOutAt.getTime()) / 60000),
        );
      }
    }

    // Calculate worked minutes (excluding break time)
    if (checkInAt && checkOutAt) {
      const totalDuration = Math.round((checkOutAt.getTime() - checkInAt.getTime()) / 60000);
      workedMinutes = Math.max(0, totalDuration - shift.breakMinutes);

      // Expected work duration for the shift
      const shiftDuration =
        Math.round((shiftEnd.getTime() - shiftStart.getTime()) / 60000) - shift.breakMinutes;

      // Calculate overtime if worked more than shift duration
      if (workedMinutes > shiftDuration) {
        overtimeMinutes = workedMinutes - shiftDuration;
      }
    }

    // Determine status
    let status: AttendanceStatus = AttendanceStatus.present;
    if (lateMinutes > 0 && earlyLeaveMinutes > 0) {
      status = AttendanceStatus.late; // Default to late if both occurred
    } else if (lateMinutes > 0) {
      status = AttendanceStatus.late;
    } else if (earlyLeaveMinutes > 0) {
      status = AttendanceStatus.early_leave;
    } else if (overtimeMinutes > 0) {
      status = AttendanceStatus.overtime;
    }

    return {
      workedMinutes,
      lateMinutes,
      earlyLeaveMinutes,
      overtimeMinutes,
      status,
    };
  }
}
