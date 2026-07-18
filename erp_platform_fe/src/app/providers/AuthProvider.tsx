import { type ReactNode, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useAuthStore } from '@features/auth/store/authStore';
import { authApi } from '@features/auth/api/authApi';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@shared/api';

/**
 * Auth Provider — Initializes auth state on app load
 *
 * Checks for existing session in localStorage and rehydrates state by fetching fresh user profile.
 */
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setLoading, isAuthenticated } = useAuthStore();
  const [isRehydrated, setIsRehydrated] = useState(false);

  useEffect(() => {
    async function rehydrateSession() {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (token && refreshToken && isAuthenticated) {
        try {
          setLoading(true);
          const meUser = await authApi.me();
          useAuthStore.getState().login(meUser, token, refreshToken);
        } catch (error) {
          console.error('Failed to rehydrate session:', error);
          useAuthStore.getState().logout();
        }
      } else {
        useAuthStore.getState().logout();
      }
      setIsRehydrated(true);
    }

    rehydrateSession();
  }, [setLoading, isAuthenticated]);

  const isLoading = useAuthStore((s) => s.isLoading);

  if (!isRehydrated || isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8fafc',
        gap: 16,
      }}>
        <Spin size="large" />
        <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
          Đang tải phiên làm việc...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
