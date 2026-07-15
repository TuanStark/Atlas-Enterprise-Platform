import { SalaryComponentType, PayrollStatus } from '@prisma/client';

export interface SalaryComponentReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  componentType?: SalaryComponentType;
  calculationType?: string;
  defaultAmount?: number;
  taxable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryStructureReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeSalaryAssignmentReadModel {
  id: string;
  tenantId: string;
  employmentId: string;
  salaryStructureId: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  baseSalary?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollPeriodReadModel {
  id: string;
  tenantId: string;
  code?: string;
  startDate?: Date;
  endDate?: Date;
  paymentDate?: Date;
  status: PayrollStatus;
  createdAt: Date;
}

export interface PayrollItemReadModel {
  id: string;
  payrollId: string;
  salaryComponentId: string;
  amount?: number;
  remark?: string;
}

export interface PayrollReadModel {
  id: string;
  tenantId: string;
  payrollPeriodId: string;
  employmentId: string;
  grossSalary?: number;
  totalAllowance?: number;
  totalDeduction?: number;
  netSalary?: number;
  status?: PayrollStatus;
  payslipFileId?: string;
  createdAt: Date;
  updatedAt: Date;
  payrollItems: PayrollItemReadModel[];
}
