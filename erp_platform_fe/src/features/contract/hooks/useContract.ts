import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { contractApi } from '../api/contractApi';
import type { CreateContractDto, CreateContractAnnexDto, Contract } from '../types';
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
    queryFn: () => contractApi.list(params),
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
      void queryClient.invalidateQueries({ queryKey: contractKeys.byEmployment(variables.employmentId) });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tạo hợp đồng thất bại');
    },
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; employmentId: string }) => contractApi.sign(id),
    onSuccess: (_, variables) => {
      message.success('Ký hợp đồng thành công!');
      void queryClient.invalidateQueries({ queryKey: contractKeys.byEmployment(variables.employmentId) });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Ký hợp đồng thất bại');
    },
  });
}

export function useCreateContractAnnex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, employmentId, data }: { contractId: string; employmentId: string; data: CreateContractAnnexDto }) => 
      contractApi.addAnnex(contractId, data),
    onSuccess: (_, variables) => {
      message.success('Tạo phụ lục thành công!');
      void queryClient.invalidateQueries({ queryKey: contractKeys.byEmployment(variables.employmentId) });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tạo phụ lục thất bại');
    },
  });
}
