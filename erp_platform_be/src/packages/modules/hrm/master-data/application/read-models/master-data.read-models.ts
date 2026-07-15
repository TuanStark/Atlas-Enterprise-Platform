export interface EmploymentTypeReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractTypeReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  durationMonth?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobTitleReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkLocationReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}
