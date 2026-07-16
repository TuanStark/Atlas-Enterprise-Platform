import type { UUID } from '@shared/types';

export interface LeaveType {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  isPaid: boolean;
}

export interface LeaveRequest {
  id: UUID;
  tenantId: UUID;
  employmentId: UUID;
  leaveTypeId: UUID;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;

  // Relations
  leaveType?: LeaveType;
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

export interface CreateLeaveRequestDto {
  employmentId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveBalance {
  id: UUID;
  employmentId: UUID;
  leaveTypeId: UUID;
  entitledDays: number;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  leaveType?: LeaveType;
}
