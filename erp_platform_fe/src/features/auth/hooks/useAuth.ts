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
export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login: setAuth, logout: clearAuth, setLoading } = useAuthStore();

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      
      const user = {
        id: credentials.email === 'admin@erp.com' ? 'admin' : 'user',
        principalId: credentials.email === 'admin@erp.com' ? 'admin' : 'user',
        username: credentials.email.split('@')[0],
        email: credentials.email,
        displayName: credentials.email === 'admin@erp.com' ? 'System Admin' : credentials.email.split('@')[0],
        roles: credentials.email === 'admin@erp.com' ? ['SUPER_ADMIN'] : [],
        permissions: ['*'],
        tenantId: 'SYSTEM',
      };

      setAuth(user, response.accessToken, response.refreshToken);
      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
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
      // Silently fail — we logout anyway
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
