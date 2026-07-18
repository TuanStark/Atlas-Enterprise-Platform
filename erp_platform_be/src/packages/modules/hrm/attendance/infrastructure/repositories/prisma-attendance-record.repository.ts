import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AttendanceRecord } from '../../domain/aggregates/attendance-record.aggregate';
import { AttendanceRecordRepository } from '../../domain/repositories/attendance-record.repository';
import { AttendanceRecordPersistenceMapper } from '../mappers/attendance-record.persistence.mapper';

@Injectable()
export class PrismaAttendanceRecordRepository implements AttendanceRecordRepository {
  constructor(private readonly prisma: PrismaService) { }

  private readonly includeRelations = {
    attendanceRecordAttendanceAdjustments: true,
    employment: {
      include: {
        employee: true,
      },
    },
  };

  async save(entity: AttendanceRecord): Promise<void> {
    const data = AttendanceRecordPersistenceMapper.toPersistence(entity);

    await this.prisma.attendanceRecord.create({
      data: {
        ...data,
        attendanceRecordAttendanceAdjustments: {
          create: entity.adjustments.map((a) => ({
            id: a.id.toString(),
            requestedByPrincipalId: a.requestedByPrincipalId,
            approvedByPrincipalId: a.approvedByPrincipalId,
            reason: a.reason,
            oldCheckIn: a.oldCheckIn,
            newCheckIn: a.newCheckIn,
            oldCheckOut: a.oldCheckOut,
            newCheckOut: a.newCheckOut,
            createdAt: a.createdAt,
          })),
        },
      },
    });
  }

  async update(entity: AttendanceRecord): Promise<void> {
    const data = AttendanceRecordPersistenceMapper.toPersistence(entity);

    await this.prisma.$transaction(async (tx) => {
      // Update core record
      await tx.attendanceRecord.update({
        where: { id: data.id },
        data: {
          shiftAssignmentId: data.shiftAssignmentId,
          checkInAt: data.checkInAt,
          checkOutAt: data.checkOutAt,
          workedMinutes: data.workedMinutes,
          overtimeMinutes: data.overtimeMinutes,
          lateMinutes: data.lateMinutes,
          earlyLeaveMinutes: data.earlyLeaveMinutes,
          status: data.status,
          source: data.source,
          deviceId: data.deviceId,
          metadata: data.metadata,
          updatedAt: data.updatedAt,
        },
      });

      // Sync adjustments
      await tx.attendanceAdjustment.deleteMany({ where: { attendanceRecordId: data.id } });
      if (entity.adjustments.length > 0) {
        await tx.attendanceAdjustment.createMany({
          data: entity.adjustments.map((a) => ({
            id: a.id.toString(),
            attendanceRecordId: data.id,
            requestedByPrincipalId: a.requestedByPrincipalId ?? null,
            approvedByPrincipalId: a.approvedByPrincipalId ?? null,
            reason: a.reason ?? null,
            oldCheckIn: a.oldCheckIn ?? null,
            newCheckIn: a.newCheckIn ?? null,
            oldCheckOut: a.oldCheckOut ?? null,
            newCheckOut: a.newCheckOut ?? null,
            createdAt: a.createdAt,
          })),
        });
      }
    });
  }

  async delete(entity: AttendanceRecord): Promise<void> {
    await this.prisma.attendanceRecord.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<AttendanceRecord | null> {
    const record = await this.prisma.attendanceRecord.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
      include: this.includeRelations,
    });
    return record ? AttendanceRecordPersistenceMapper.toDomain(record) : null;
  }

  async findByEmploymentIdAndDate(
    tenantId: Identifier,
    employmentId: Identifier,
    date: Date,
  ): Promise<AttendanceRecord | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const record = await this.prisma.attendanceRecord.findFirst({
      where: {
        tenantId: tenantId.toString(),
        employmentId: employmentId.toString(),
        attendanceDate: startOfDay,
      },
      include: this.includeRelations,
    });
    return record ? AttendanceRecordPersistenceMapper.toDomain(record) : null;
  }

  async findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<AttendanceRecord[]> {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { employmentId: employmentId.toString(), tenantId: tenantId.toString() },
      include: this.includeRelations,
      orderBy: { attendanceDate: 'desc' },
    });
    return records.map(AttendanceRecordPersistenceMapper.toDomain);
  }

  async findAll(tenantId: Identifier): Promise<AttendanceRecord[]> {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { tenantId: tenantId.toString() },
      include: this.includeRelations,
      orderBy: { attendanceDate: 'desc' },
    });
    return records.map(AttendanceRecordPersistenceMapper.toDomain);
  }
}
