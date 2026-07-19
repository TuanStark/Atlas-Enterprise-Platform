import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { positionApi } from '../api/positionApi';
import type { CreatePositionDto, UpdatePositionDto } from '../types';
import { message } from 'antd';

export function usePositions(orgId?: string) {
  return useQuery({
    queryKey: ['positions', orgId],
    queryFn: () => positionApi.getPositions(orgId!),
    enabled: !!orgId,
  });
}

export function useCreatePosition(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePositionDto) => positionApi.createPosition(orgId!, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['positions', orgId] });
      message.success('Đã tạo vị trí công việc mới thành công!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi khi tạo vị trí công việc');
    },
  });
}

export function useUpdatePosition(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePositionDto }) =>
      positionApi.updatePosition(orgId!, id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['positions', orgId] });
      message.success('Cập nhật vị trí công việc thành công!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi khi cập nhật vị trí công việc');
    },
  });
}

export function useDeletePosition(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => positionApi.deletePosition(orgId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['positions', orgId] });
      message.success('Đã xóa vị trí công việc thành công!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi khi xóa vị trí công việc');
    },
  });
}
