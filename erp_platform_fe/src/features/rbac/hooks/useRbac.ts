import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { rbacApi } from '../api/rbacApi';
import type { Role, Permission, ManagedUser, AuditLog, PrincipalRole, CreateRoleDto } from '../types';
import type { ApiError } from '@shared/types';

/**
 * RBAC Query Keys — follows React Query key factory pattern
 */
const rbacKeys = {
  all: ['rbac'] as const,
  roles: () => [...rbacKeys.all, 'roles'] as const,
  role: (id: string) => [...rbacKeys.all, 'role', id] as const,
  permissions: () => [...rbacKeys.all, 'permissions'] as const,
  principalRoles: (principalId: string) => [...rbacKeys.all, 'principal-roles', principalId] as const,
  users: () => [...rbacKeys.all, 'users'] as const,
  auditLogs: () => [...rbacKeys.all, 'audit-logs'] as const,
};

// --- Role Hooks ---

export function useRoles(tenantId: string) {
  return useQuery<Role[], ApiError>({
    queryKey: rbacKeys.roles(),
    queryFn: () => rbacApi.listRoles(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useRole(id: string | undefined) {
  return useQuery<Role, ApiError>({
    queryKey: rbacKeys.role(id!),
    queryFn: () => rbacApi.getRole(id!),
    enabled: Boolean(id),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRoleDto) => rbacApi.createRole(dto),
    onSuccess: () => {
      message.success('Đã tạo vai trò mới!');
      void queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tạo vai trò thất bại');
    },
  });
}

export function useAssignPermissionToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      rbacApi.assignPermissionToRole(roleId, { permissionId }),
    onSuccess: () => {
      message.success('Đã gán quyền cho vai trò!');
      void queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Gán quyền thất bại');
    },
  });
}

export function useRemovePermissionFromRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      rbacApi.removePermissionFromRole(roleId, permissionId),
    onSuccess: () => {
      message.success('Đã thu hồi quyền khỏi vai trò!');
      void queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Thu hồi quyền thất bại');
    },
  });
}

// --- Permission Hooks ---

export function usePermissions() {
  return useQuery<Permission[], ApiError>({
    queryKey: rbacKeys.permissions(),
    queryFn: rbacApi.listPermissions,
  });
}

// --- Principal Role Hooks ---

export function usePrincipalRoles(principalId: string | undefined) {
  return useQuery<PrincipalRole[], ApiError>({
    queryKey: rbacKeys.principalRoles(principalId!),
    queryFn: () => rbacApi.listPrincipalRoles(principalId!),
    enabled: Boolean(principalId),
  });
}

export function useAssignRoleToPrincipal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ principalId, roleId, scopeId }: { principalId: string; roleId: string; scopeId: string }) =>
      rbacApi.assignRoleToPrincipal(principalId, { roleId, scopeId }),
    onSuccess: () => {
      message.success('Đã gán vai trò cho người dùng!');
      void queryClient.invalidateQueries({ queryKey: rbacKeys.all });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Gán vai trò thất bại');
    },
  });
}

export function useRemoveRoleFromPrincipal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ principalId, roleId, scopeId }: { principalId: string; roleId: string; scopeId: string }) =>
      rbacApi.removeRoleFromPrincipal(principalId, roleId, scopeId),
    onSuccess: () => {
      message.success('Đã thu hồi vai trò!');
      void queryClient.invalidateQueries({ queryKey: rbacKeys.all });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Thu hồi vai trò thất bại');
    },
  });
}

// --- User Management Hooks ---

export function useManagedUsers() {
  return useQuery<ManagedUser[], ApiError>({
    queryKey: rbacKeys.users(),
    queryFn: rbacApi.listUsers,
  });
}

// --- Audit Log Hooks ---

export function useAuditLogs(params?: { module?: string; action?: string; limit?: number }) {
  return useQuery<AuditLog[], ApiError>({
    queryKey: [...rbacKeys.auditLogs(), params],
    queryFn: () => rbacApi.listAuditLogs(params),
  });
}
