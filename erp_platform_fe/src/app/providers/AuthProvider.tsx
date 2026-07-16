import { type ReactNode, useEffect } from 'react';
import { useAuthStore } from '@features/auth/store/authStore';
import { ACCESS_TOKEN_KEY } from '@shared/api';

/**
 * Auth Provider — Initializes auth state on app load
 *
 * Checks for existing session in localStorage and rehydrates state.
 */
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Zustand persist middleware auto-rehydrates from localStorage
    // We just need to validate the token still exists
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token && isAuthenticated) {
      // Token was cleared externally, sync state
      useAuthStore.getState().logout();
    }
    setLoading(false);
  }, [setLoading, isAuthenticated]);

  return <>{children}</>;
}
