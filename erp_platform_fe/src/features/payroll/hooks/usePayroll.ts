import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { payrollApi } from '../api/payrollApi';
import type { PayrollPeriod, Payroll } from '../types';
import type { ApiError } from '@shared/types';

const payrollKeys = {
  all: ['payroll'] as const,
  periods: () => [...payrollKeys.all, 'periods'] as const,
  payrolls: (periodId: string) => [...payrollKeys.all, 'payrolls', periodId] as const,
};

export function usePayrollPeriods() {
  return useQuery<PayrollPeriod[], ApiError>({
    queryKey: payrollKeys.periods(),
    queryFn: payrollApi.getPeriods,
  });
}

export function usePayrollsByPeriod(periodId: string | undefined) {
  return useQuery<Payroll[], ApiError>({
    queryKey: payrollKeys.payrolls(periodId || ''),
    queryFn: () => payrollApi.getPayrollsByPeriod(periodId!),
    enabled: Boolean(periodId),
  });
}

export function useCreatePayrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PayrollPeriod>) => payrollApi.createPeriod(data),
    onSuccess: () => {
      message.success('Đã tạo chu kỳ tính lương mới thành công!');
      void queryClient.invalidateQueries({ queryKey: payrollKeys.periods() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tạo chu kỳ tính lương thất bại');
    },
  });
}

export function useCalculatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (periodId: string) => payrollApi.calculatePayroll(periodId),
    onSuccess: (_, periodId) => {
      message.success('Tính toán bảng lương hoàn tất!');
      void queryClient.invalidateQueries({ queryKey: payrollKeys.payrolls(periodId) });
      void queryClient.invalidateQueries({ queryKey: payrollKeys.periods() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tính toán bảng lương thất bại');
    },
  });
}
