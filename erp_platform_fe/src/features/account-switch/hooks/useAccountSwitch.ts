import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { accountSwitchApi } from '../api/accountSwitchApi';
import { useAuthStore } from '@features/auth/store/authStore';
import { authApi } from '@features/auth/api/authApi';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@shared/api';
import type { PaginatedSwitchableUsersResponse } from '../types';
import type { ApiError } from '@shared/types';

const accountSwitchKeys = {
  all: ['account-switch'] as const,
  switchableUsers: (params?: { search?: string; limit?: number; offset?: number }) =>
    [...accountSwitchKeys.all, 'switchable-users', params] as const,
};

export function useSwitchableUsers(params?: { search?: string; limit?: number; offset?: number }) {
  return useQuery<PaginatedSwitchableUsersResponse, ApiError>({
    queryKey: accountSwitchKeys.switchableUsers(params),
    queryFn: () => accountSwitchApi.listSwitchableUsers(params),
    staleTime: 15_000,
  });
}

export function useSwitchAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipalId: string) => {
      const response = await accountSwitchApi.switchAccount({ targetPrincipalId });
      return response;
    },
    onSuccess: async (response) => {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

      const meUser = await authApi.me();
      useAuthStore.getState().login(meUser, response.accessToken, response.refreshToken);

      await queryClient.invalidateQueries();

      message.success(`Đang đóng vai: ${meUser.displayName || meUser.username}`);

      window.location.reload();
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Chuyển đổi tài khoản thất bại');
    },
  });
}

export function useEndImpersonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await accountSwitchApi.endImpersonation();
      return response;
    },
    onSuccess: async (response) => {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

      const meUser = await authApi.me();
      useAuthStore.getState().login(meUser, response.accessToken, response.refreshToken);

      await queryClient.invalidateQueries();

      message.success('Đã quay lại tài khoản gốc');
      window.location.reload();
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Không thể quay lại tài khoản gốc');
    },
  });
}
