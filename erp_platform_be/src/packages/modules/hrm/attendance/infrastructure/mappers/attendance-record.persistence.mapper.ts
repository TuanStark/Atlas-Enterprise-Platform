import {
  AttendanceRecord as PrismaAttendanceRecord,
  AttendanceAdjustment as PrismaAdjustment,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AttendanceRecord } from '../../domain/aggregates/attendance-record.aggregate';
import { AttendanceAdjustment } from '../../domain/entities/attendance-adjustment.entity';

export type PrismaAttendanceRecordPayload = PrismaAttendanceRecord & {
  attendanceRecordAttendanceAdjustments?: PrismaAdjustment[];
};

export class AttendanceRecordPersistenceMapper {
  static toDomain(prisma: PrismaAttendanceRecordPayload): AttendanceRecord {
    const id = Identifier.create(prisma.id);

    return AttendanceRecord.rehydrate(id, {
      tenantId: Identifier.create(prisma.tenantId),
      employmentId: Identifier.create(prisma.employmentId),
      shiftAssignmentId: prisma.shiftAssignmentId
        ? Identifier.create(prisma.shiftAssignmentId)
        : undefined,
      attendanceDate: prisma.attendanceDate,
      checkInAt: prisma.checkInAt ?? undefined,
      checkOutAt: prisma.checkOutAt ?? undefined,
      workedMinutes: prisma.workedMinutes ?? undefined,
      overtimeMinutes: prisma.overtimeMinutes ?? 0,
      lateMinutes: prisma.lateMinutes ?? 0,
      earlyLeaveMinutes: prisma.earlyLeaveMinutes ?? 0,
      status: prisma.status ?? undefined,
      source: prisma.source ?? undefined,
      deviceId: prisma.deviceId ?? undefined,
      metadata: prisma.metadata as Record<string, unknown> | undefined,
      adjustments: (prisma.attendanceRecordAttendanceAdjustments ?? []).map((a) =>
        AttendanceAdjustment.rehydrate(Identifier.create(a.id), {
          attendanceRecordId: id,
          requestedByPrincipalId: a.requestedByPrincipalId ?? undefined,
          approvedByPrincipalId: a.approvedByPrincipalId ?? undefined,
          reason: a.reason ?? undefined,
          oldCheckIn: a.oldCheckIn ?? undefined,
          newCheckIn: a.newCheckIn ?? undefined,
          oldCheckOut: a.oldCheckOut ?? undefined,
          newCheckOut: a.newCheckOut ?? undefined,
          createdAt: a.createdAt ?? new Date(),
        }),
      ),
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: AttendanceRecord) {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      shiftAssignmentId: entity.shiftAssignmentId ? entity.shiftAssignmentId.toString() : null,
      attendanceDate: entity.attendanceDate,
      checkInAt: entity.checkInAt ?? null,
      checkOutAt: entity.checkOutAt ?? null,
      workedMinutes: entity.workedMinutes ?? null,
      overtimeMinutes: entity.overtimeMinutes,
      lateMinutes: entity.lateMinutes,
      earlyLeaveMinutes: entity.earlyLeaveMinutes,
      status: entity.status ?? null,
      source: entity.source ?? null,
      deviceId: entity.deviceId ?? null,
      metadata: entity.metadata as any,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
