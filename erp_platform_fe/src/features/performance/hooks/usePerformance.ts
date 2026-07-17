import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { performanceApi } from '../api/performanceApi';
import type { PerformanceCycle, PerformanceGoal } from '../types';
import type { ApiError } from '@shared/types';

const performanceKeys = {
  all: ['performance'] as const,
  cycles: () => [...performanceKeys.all, 'cycles'] as const,
  goals: () => [...performanceKeys.all, 'goals'] as const,
};

export function usePerformanceCycles() {
  return useQuery<PerformanceCycle[], ApiError>({
    queryKey: performanceKeys.cycles(),
    queryFn: performanceApi.getCycles,
  });
}

export function useCreatePerformanceCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PerformanceCycle>) => performanceApi.createCycle(data),
    onSuccess: () => {
      message.success('Đã tạo chu kỳ đánh giá hiệu suất mới!');
      void queryClient.invalidateQueries({ queryKey: performanceKeys.cycles() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tạo chu kỳ đánh giá thất bại');
    },
  });
}

export function useDeletePerformanceCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.deleteCycle(id),
    onSuccess: () => {
      message.success('Đã xóa chu kỳ đánh giá!');
      void queryClient.invalidateQueries({ queryKey: performanceKeys.cycles() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Xóa chu kỳ đánh giá thất bại');
    },
  });
}

export function usePerformanceGoals() {
  return useQuery<PerformanceGoal[], ApiError>({
    queryKey: performanceKeys.goals(),
    queryFn: performanceApi.getGoals,
  });
}

export function useCreatePerformanceGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PerformanceGoal>) => performanceApi.createGoal(data),
    onSuccess: () => {
      message.success('Đã thêm mục tiêu hiệu suất mới!');
      void queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Thêm mục tiêu thất bại');
    },
  });
}
