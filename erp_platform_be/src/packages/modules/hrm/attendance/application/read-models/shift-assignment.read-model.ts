export interface ShiftAssignmentReadModel {
  id: string;
  tenantId: string;
  employmentId: string;
  shiftId: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}
