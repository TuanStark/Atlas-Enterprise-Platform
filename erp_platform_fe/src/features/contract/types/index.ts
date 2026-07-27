export interface Contract {
  id: string;
  tenantId: string;
  employmentId: string;
  contractNo: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate?: string;
  baseSalary: number;
  salaryCurrency: string;
  workingHoursPerWeek?: number;
  templateId?: string;
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

export interface CreateContractAnnexDto {
  content: string;
  effectiveDate: string;
}
