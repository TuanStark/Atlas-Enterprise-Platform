import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { archiveApi } from '../api/archiveApi';
import type { CreateArchiveRecordDto, ArchiveRecord } from '../types';
import type { ApiError } from '@shared/types';

const archiveKeys = {
  all: ['archives'] as const,
  lists: () => [...archiveKeys.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...archiveKeys.lists(), params] as const,
  detail: (id: string) => [...archiveKeys.all, 'detail', id] as const,
};

export function useArchiveRecords(params?: {
  page?: number;
  pageSize?: number;
  sourceModule?: string;
  sourceEntity?: string;
}) {
  return useQuery<{ data: ArchiveRecord[]; total: number }, ApiError>({
    queryKey: archiveKeys.list(params),
    queryFn: () => archiveApi.getAll(params),
  });
}

export function useArchiveRecordDetail(id?: string) {
  return useQuery<ArchiveRecord, ApiError>({
    queryKey: archiveKeys.detail(id!),
    queryFn: () => archiveApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useArchiveRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArchiveRecordDto) => archiveApi.create(data),
    onSuccess: () => {
      message.success('Lưu trữ thành công!');
      void queryClient.invalidateQueries({ queryKey: archiveKeys.lists() });
      // Also invalidate contracts list so archived contract disappears
      void queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Lưu trữ thất bại');
    },
  });
}

export function useUnarchiveRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveApi.unarchive(id),
    onSuccess: () => {
      message.success('Khôi phục thành công!');
      void queryClient.invalidateQueries({ queryKey: archiveKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Khôi phục thất bại');
    },
  });
}
