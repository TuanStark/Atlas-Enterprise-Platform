import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { shiftApi } from '../api/shiftApi';
import type { Shift, ShiftAssignment } from '../types';
import type { ApiError } from '@shared/types';

const shiftKeys = {
  all: ['shifts'] as const,
  templates: () => [...shiftKeys.all, 'templates'] as const,
  assignments: (employmentId: string) => [...shiftKeys.all, 'assignments', employmentId] as const,
};

export function useShifts() {
  return useQuery<Shift[], ApiError>({
    queryKey: shiftKeys.templates(),
    queryFn: shiftApi.getShifts,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Shift>) => shiftApi.createShift(data),
    onSuccess: () => {
      message.success('Đã tạo ca làm việc mới!');
      void queryClient.invalidateQueries({ queryKey: shiftKeys.templates() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tạo ca làm việc thất bại');
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Shift> }) =>
      shiftApi.updateShift(id, payload),
    onSuccess: () => {
      message.success('Đã cập nhật ca làm việc!');
      void queryClient.invalidateQueries({ queryKey: shiftKeys.templates() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Cập nhật thất bại');
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shiftApi.deleteShift(id),
    onSuccess: () => {
      message.success('Đã xóa ca làm việc thành công!');
      void queryClient.invalidateQueries({ queryKey: shiftKeys.templates() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Xóa ca thất bại');
    },
  });
}

export function useAssignShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employmentId,
      payload,
    }: {
      employmentId: string;
      payload: { shiftId: string; effectiveFrom: string; effectiveTo?: string };
    }) => shiftApi.assignShift(employmentId, payload),
    onSuccess: (_, variables) => {
      message.success('Đã gán ca làm việc thành công!');
      void queryClient.invalidateQueries({ queryKey: shiftKeys.assignments(variables.employmentId) });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Gán ca thất bại');
    },
  });
}

export function useEmployeeAssignments(employmentId: string | undefined) {
  return useQuery<ShiftAssignment[], ApiError>({
    queryKey: shiftKeys.assignments(employmentId || ''),
    queryFn: () => shiftApi.getAssignments(employmentId!),
    enabled: Boolean(employmentId),
  });
}
