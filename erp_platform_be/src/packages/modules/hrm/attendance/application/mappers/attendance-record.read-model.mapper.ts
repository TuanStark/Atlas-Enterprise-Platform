import { AttendanceRecord } from '../../domain/aggregates/attendance-record.aggregate';
import { AttendanceRecordReadModel } from '../read-models/attendance-record.read-model';

export class AttendanceRecordReadModelMapper {
  static toReadModel(entity: AttendanceRecord): AttendanceRecordReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      shiftAssignmentId: entity.shiftAssignmentId ? entity.shiftAssignmentId.toString() : undefined,
      attendanceDate: entity.attendanceDate,
      checkInAt: entity.checkInAt,
      checkOutAt: entity.checkOutAt,
      workedMinutes: entity.workedMinutes,
      overtimeMinutes: entity.overtimeMinutes,
      lateMinutes: entity.lateMinutes,
      earlyLeaveMinutes: entity.earlyLeaveMinutes,
      status: entity.status,
      source: entity.source,
      deviceId: entity.deviceId,
      adjustments: entity.adjustments.map((a) => ({
        id: a.id.toString(),
        attendanceRecordId: a.attendanceRecordId.toString(),
        requestedByPrincipalId: a.requestedByPrincipalId,
        approvedByPrincipalId: a.approvedByPrincipalId,
        reason: a.reason,
        oldCheckIn: a.oldCheckIn,
        newCheckIn: a.newCheckIn,
        oldCheckOut: a.oldCheckOut,
        newCheckOut: a.newCheckOut,
        createdAt: a.createdAt,
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      employment: entity.employment
        ? {
            id: entity.employment.id,
            employee: entity.employment.employee
              ? {
                  id: entity.employment.employee.id,
                  firstName: entity.employment.employee.firstName,
                  lastName: entity.employment.employee.lastName,
                  displayName:
                    `${entity.employment.employee.lastName || ''} ${entity.employment.employee.firstName || ''}`.trim(),
                }
              : undefined,
          }
        : undefined,
    };
  }
}
