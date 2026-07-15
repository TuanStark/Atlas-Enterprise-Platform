import { EmploymentStatus } from '@prisma/client';

export interface EmploymentReadModel {
  id: string;
  tenantId: string;
  employeeId: string;
  employmentTypeId: string;
  employeeCode: string;
  hireDate: Date;
  probationStartDate?: Date;
  probationEndDate?: Date;
  confirmationDate?: Date;
  terminationDate?: Date;
  status: EmploymentStatus;
  reason?: string;
  metadata?: Record<string, unknown>;
  contracts: EmploymentContractReadModel[];
  statusHistory: EmploymentStatusHistoryReadModel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmploymentContractReadModel {
  id: string;
  contractTypeId: string;
  contractNumber: string;
  startDate: Date;
  endDate?: Date;
  signedDate?: Date;
  fileId?: string;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmploymentStatusHistoryReadModel {
  id: string;
  fromStatus?: EmploymentStatus;
  toStatus?: EmploymentStatus;
  effectiveDate: Date;
  reason?: string;
  changedByPrincipalId?: string;
  createdAt: Date;
}
