export type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated';

export interface Contract {
  id: string;
  tenantId: string;
  employmentId: string;
  contractNo: string;
  contractNumber: string;
  contractType: string;
  status: ContractStatus;
  startDate: string;
  endDate?: string;
  signedDate?: string;
  fileId?: string;
  baseSalary: number;
  salaryCurrency: string;
  workingHoursPerWeek?: number;
  templateId?: string;
  employeeName?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ContractAnnex {
  id: string;
  tenantId: string;
  contractId: string;
  annexNo: string;
  content: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractDto {
  employmentId: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  baseSalary: number;
  salaryCurrency: string;
  workingHoursPerWeek?: number;
  templateId?: string;
  metadata?: any;
}

export interface UpdateContractDto {
  contractType?: string;
  startDate?: string;
  endDate?: string;
  baseSalary?: number;
  salaryCurrency?: string;
  workingHoursPerWeek?: number;
}

export interface CreateContractAnnexDto {
  annexNumber?: string;
  content: string;
  effectiveDate: string;
}

export interface TerminateContractDto {
  terminationDate: string;
  reason?: string;
}

export interface SignContractDto {
  signedDate: string;
  fileId?: string;
}
