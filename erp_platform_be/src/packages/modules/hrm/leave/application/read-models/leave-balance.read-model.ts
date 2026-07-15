export interface LeaveBalanceReadModel {
  id: string;
  tenantId: string;
  employmentId: string;
  leaveTypeId: string;
  leaveYear: number;
  entitledDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  updatedAt: Date;
}
