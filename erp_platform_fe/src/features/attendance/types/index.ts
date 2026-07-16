import type { UUID } from '@shared/types';

export interface AttendanceRecord {
  id: UUID;
  tenantId: UUID;
  employmentId: UUID;
  attendanceDate: string;
  checkInAt?: string;
  checkOutAt?: string;
  workedMinutes?: number;
  overtimeMinutes?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'overtime' | 'holiday';
  source?: 'web' | 'mobile' | 'biometric' | 'device';
  createdAt: string;
  updatedAt: string;

  // Relations
  employment?: {
    id: UUID;
    employee?: {
      id: UUID;
      firstName: string;
      lastName: string;
      displayName: string;
    };
  };
}

export interface CheckInDto {
  employmentId: string;
  checkInTime: string;
  source: string;
  deviceCode?: string;
  ipAddress?: string;
}

export interface CheckOutDto {
  checkOutTime: string;
  source: string;
  deviceCode?: string;
  ipAddress?: string;
}
