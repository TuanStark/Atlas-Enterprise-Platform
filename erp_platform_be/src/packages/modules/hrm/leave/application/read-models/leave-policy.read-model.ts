export interface LeavePolicyReadModel {
  id: string;
  tenantId: string;
  leaveTypeId: string;
  employmentTypeId?: string;
  annualDays: number;
  maxConsecutiveDays?: number;
  carryForwardLimit?: number;
  requiresApproval: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}
