import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';
import type { LoginRequest } from '@shared/types';
import type { ApiError } from '@shared/types';

/**
 * useAuth — Main auth hook for login/logout operations
 */
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@shared/api';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login: setAuth, logout: clearAuth, setLoading } = useAuthStore();

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);

      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

      const meUser = await authApi.me();

      setAuth(meUser, response.accessToken, response.refreshToken);
      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      const apiError = error as ApiError;
      message.error(apiError.message || apiError.detail || 'Đăng nhập thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, navigate]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}

/**
 * useCurrentUser — Quick access to current user info
 */
export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

/**
 * usePermission — Check PBAC permissions
 * Maps to backend's Policy Evaluation Engine
 *
 * Usage: const canCreate = usePermission('hrm.employee', 'create');
 */
export function usePermission(resource: string, action: string): boolean {
  return useAuthStore((state) => state.hasPermission(resource, action));
}

/**
 * useHasRole — Check if user has a specific role
 *
 * Usage: const isHrManager = useHasRole('HR_Manager');
 */
export function useHasRole(role: string): boolean {
  return useAuthStore((state) => state.hasRole(role));
}
