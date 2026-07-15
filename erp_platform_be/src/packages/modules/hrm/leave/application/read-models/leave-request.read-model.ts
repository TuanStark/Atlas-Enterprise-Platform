import { LeaveRequestStatus } from '@prisma/client';

export interface LeaveRequestReadModel {
  id: string;
  tenantId: string;
  employmentId: string;
  leaveTypeId: string;
  workflowInstanceId?: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  status: LeaveRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}
