import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AttendanceRecord } from '../aggregates/attendance-record.aggregate';

export const ATTENDANCE_RECORD_REPOSITORY = Symbol('ATTENDANCE_RECORD_REPOSITORY');

export interface AttendanceRecordRepository {
  save(entity: AttendanceRecord): Promise<void>;
  update(entity: AttendanceRecord): Promise<void>;
  delete(entity: AttendanceRecord): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<AttendanceRecord | null>;
  findByEmploymentIdAndDate(
    tenantId: Identifier,
    employmentId: Identifier,
    date: Date,
  ): Promise<AttendanceRecord | null>;
  findByEmploymentId(tenantId: Identifier, employmentId: Identifier): Promise<AttendanceRecord[]>;
  findAll(tenantId: Identifier): Promise<AttendanceRecord[]>;
}
