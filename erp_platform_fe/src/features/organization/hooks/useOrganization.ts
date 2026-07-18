import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgApi } from '../api/orgApi';
import type { CreateOrganizationUnitDto, UpdateOrganizationUnitDto, MoveOrganizationUnitDto } from '../types';
import { message } from 'antd';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => orgApi.getOrganizations(),
  });
}

export function useOrgUnitTree(orgId?: string) {
  return useQuery({
    queryKey: ['org-unit-tree', orgId],
    queryFn: () => orgApi.getOrgUnitTree(orgId!),
    enabled: !!orgId,
  });
}

export function useUnitTypes() {
  return useQuery({
    queryKey: ['org-unit-types'],
    queryFn: () => orgApi.getUnitTypes(),
  });
}

export function useCreateOrgUnit(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrganizationUnitDto) => orgApi.createOrgUnit(orgId!, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['org-unit-tree', orgId] });
      message.success('Đã tạo phòng ban mới thành công!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi khi tạo phòng ban');
    },
  });
}

export function useUpdateOrgUnit(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ unitId, payload }: { unitId: string; payload: UpdateOrganizationUnitDto }) =>
      orgApi.updateOrgUnit(orgId!, unitId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['org-unit-tree', orgId] });
      message.success('Đã cập nhật thông tin phòng ban thành công!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi khi cập nhật phòng ban');
    },
  });
}

export function useDeleteOrgUnit(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) => orgApi.deleteOrgUnit(orgId!, unitId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['org-unit-tree', orgId] });
      message.success('Đã xóa phòng ban thành công!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi khi xóa phòng ban');
    },
  });
}

export function useMoveOrgUnit(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ unitId, payload }: { unitId: string; payload: MoveOrganizationUnitDto }) =>
      orgApi.moveOrgUnit(orgId!, unitId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['org-unit-tree', orgId] });
      message.success('Đã di chuyển phòng ban thành công!');
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi khi di chuyển phòng ban');
    },
  });
}
