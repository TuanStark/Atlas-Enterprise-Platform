export interface LeaveTypeReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  isPaid: boolean;
  requiresAttachment: boolean;
  color?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
