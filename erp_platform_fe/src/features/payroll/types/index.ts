export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'processed' | 'closed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Payroll {
  id: string;
  payrollPeriodId: string;
  employmentId: string;
  employment?: {
    id: string;
    employee?: {
      id: string;
      firstName: string;
      lastName: string;
      employeeCode?: string;
    };
  };
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'approved' | 'paid';
  processedAt?: string;
}
