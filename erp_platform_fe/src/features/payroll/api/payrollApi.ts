import { httpClient } from '@shared/api';
import type { PayrollPeriod, Payroll } from '../types';

export const payrollApi = {
  // Periods
  async getPeriods(): Promise<PayrollPeriod[]> {
    const { data } = await httpClient.get<PayrollPeriod[]>('/payroll-periods');
    return data;
  },

  async getPeriodById(id: string): Promise<PayrollPeriod> {
    const { data } = await httpClient.get<PayrollPeriod>(`/payroll-periods/${id}`);
    return data;
  },

  async createPeriod(payload: Partial<PayrollPeriod>): Promise<PayrollPeriod> {
    const { data } = await httpClient.post<PayrollPeriod>('/payroll-periods', payload);
    return data;
  },

  async updatePeriod(id: string, payload: Partial<PayrollPeriod>): Promise<PayrollPeriod> {
    const { data } = await httpClient.patch<PayrollPeriod>(`/payroll-periods/${id}`, payload);
    return data;
  },

  async deletePeriod(id: string): Promise<void> {
    await httpClient.delete(`/payroll-periods/${id}`);
  },

  async calculatePayroll(periodId: string): Promise<void> {
    await httpClient.post(`/payroll-periods/${periodId}/calculate`);
  },

  // Payrolls
  async getPayrollsByPeriod(periodId: string): Promise<Payroll[]> {
    const { data } = await httpClient.get<Payroll[]>(`/payrolls/period/${periodId}`);
    return data;
  },

  async updatePayroll(id: string, payload: Partial<Payroll>): Promise<Payroll> {
    const { data } = await httpClient.patch<Payroll>(`/payrolls/${id}`, payload);
    return data;
  },
};
