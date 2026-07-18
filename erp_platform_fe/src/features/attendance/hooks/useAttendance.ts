import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { attendanceApi } from '../api/attendanceApi';
import type { CheckInDto, CheckOutDto, AttendanceRecord } from '../types';
import type { ApiError } from '@shared/types';

const attendanceKeys = {
  all: ['attendance'] as const,
  records: () => [...attendanceKeys.all, 'records'] as const,
  employment: (employmentId: string) => [...attendanceKeys.all, 'employment', employmentId] as const,
};

/** Get all attendance records */
export function useAttendanceRecords() {
  return useQuery<AttendanceRecord[], ApiError>({
    queryKey: attendanceKeys.records(),
    queryFn: attendanceApi.listAll,
  });
}

/** Get attendance records for a specific employment */
export function useAttendanceByEmployment(employmentId: string | undefined) {
  return useQuery({
    queryKey: attendanceKeys.employment(employmentId!),
    queryFn: () => attendanceApi.listByEmployment(employmentId!),
    enabled: Boolean(employmentId),
  });
}

/** Log check-in */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CheckInDto) => attendanceApi.checkIn(dto),
    onSuccess: () => {
      message.success('Check-in thành công!');
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Check-in thất bại');
    },
  });
}

/** Log check-out */
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, dto }: { recordId: string; dto: CheckOutDto }) =>
      attendanceApi.checkOut(recordId, dto),
    onSuccess: () => {
      message.success('Check-out thành công!');
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Check-out thất bại');
    },
  });
}
