import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaveApi } from '../api/leaveApi';
import type { LeaveRequest, CreateLeaveRequestDto } from '../types';
import type { ApiError } from '@shared/types';

const leaveKeys = {
  all: ['leaves'] as const,
  requests: () => [...leaveKeys.all, 'requests'] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  balances: (employmentId: string) => [...leaveKeys.all, 'balances', employmentId] as const,
};

/** Get list of all leave requests */
export function useLeaveRequests() {
  return useQuery<LeaveRequest[], ApiError>({
    queryKey: leaveKeys.requests(),
    queryFn: leaveApi.listRequests,
  });
}

/** Get list of all leave types */
export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: leaveApi.listTypes,
  });
}

/** Get leave balances for an employment */
export function useLeaveBalances(employmentId: string | undefined) {
  return useQuery({
    queryKey: leaveKeys.balances(employmentId!),
    queryFn: () => leaveApi.listBalances(employmentId!),
    enabled: Boolean(employmentId),
  });
}

/** Submit a new leave request */
export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestDto) => leaveApi.create(data as Partial<LeaveRequest>),
    onSuccess: () => {
      message.success('Đã gửi đơn xin nghỉ phép thành công!');
      void queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Gửi đơn xin nghỉ phép thất bại');
    },
  });
}

/** Approve a leave request */
export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveApi.approve(id),
    onSuccess: () => {
      message.success('Đã duyệt đơn nghỉ phép!');
      void queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Duyệt đơn nghỉ phép thất bại');
    },
  });
}

/** Reject a leave request */
export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => leaveApi.reject(id, reason),
    onSuccess: () => {
      message.success('Đã từ chối đơn nghỉ phép!');
      void queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Không thể thực hiện yêu cầu');
    },
  });
}
