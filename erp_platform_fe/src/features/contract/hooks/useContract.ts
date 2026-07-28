import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { contractApi } from '../api/contractApi';
import type { CreateContractDto, CreateContractAnnexDto, UpdateContractDto, TerminateContractDto, SignContractDto, Contract } from '../types';
import type { ApiError, ListQueryParams, OffsetPaginatedResponse } from '@shared/types';

const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (params?: ListQueryParams) => [...contractKeys.lists(), params] as const,
  byEmployment: (employmentId: string) => [...contractKeys.all, 'employment', employmentId] as const,
};

export function useContracts(params?: ListQueryParams) {
  return useQuery<OffsetPaginatedResponse<Contract>, ApiError>({
    queryKey: contractKeys.list(params),
    queryFn: () => contractApi.getAll(params),
  });
}

export function useEmploymentContracts(employmentId?: string) {
  return useQuery<Contract[], ApiError>({
    queryKey: contractKeys.byEmployment(employmentId!),
    queryFn: () => contractApi.getByEmployment(employmentId!),
    enabled: Boolean(employmentId),
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractDto) => contractApi.create(data),
    onSuccess: (_, variables) => {
      message.success('Tạo hợp đồng thành công!');
      void queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: contractKeys.byEmployment(variables.employmentId) });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tạo hợp đồng thất bại');
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractDto }) =>
      contractApi.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật hợp đồng thành công!');
      void queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Cập nhật hợp đồng thất bại');
    },
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; employmentId?: string; data?: SignContractDto }) =>
      contractApi.sign(id, data),
    onSuccess: (_, variables) => {
      message.success('Ký hợp đồng thành công!');
      void queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      if (variables.employmentId) {
        void queryClient.invalidateQueries({ queryKey: contractKeys.byEmployment(variables.employmentId) });
      }
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Ký hợp đồng thất bại');
    },
  });
}

export function useTerminateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TerminateContractDto }) =>
      contractApi.terminate(id, data),
    onSuccess: () => {
      message.success('Chấm dứt hợp đồng thành công!');
      void queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Chấm dứt hợp đồng thất bại');
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractApi.deleteContract(id),
    onSuccess: () => {
      message.success('Đã xóa hợp đồng!');
      void queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Xóa hợp đồng thất bại');
    },
  });
}

export function useCreateContractAnnex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, data }: { contractId: string; employmentId?: string; data: CreateContractAnnexDto }) =>
      contractApi.addAnnex(contractId, data),
    onSuccess: (_, variables) => {
      message.success('Tạo phụ lục thành công!');
      void queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      if (variables.employmentId) {
        void queryClient.invalidateQueries({ queryKey: contractKeys.byEmployment(variables.employmentId) });
      }
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tạo phụ lục thất bại');
    },
  });
}

export function useExportContracts() {
  return useMutation({
    mutationFn: (params?: { status?: string }) => contractApi.exportToExcel(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hop-dong-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Xuất dữ liệu thành công!');
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Xuất dữ liệu thất bại');
    },
  });
}
