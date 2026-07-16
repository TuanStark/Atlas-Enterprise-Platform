import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, AuthActions } from '../types';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@shared/api';

/**
 * Auth Store — Zustand global state for authentication
 *
 * Persisted to localStorage so that page refresh doesn't lose session.
 * Syncs tokens to localStorage for Axios interceptors.
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // --- State ---
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      // --- Actions ---
      login: (user, accessToken, refreshToken) => {
        // Sync to localStorage for axios interceptors
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (partialUser) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...partialUser } });
        }
      },

      /**
       * Check if current user has a specific permission
       * Maps to backend PBAC: resource + action format
       * e.g., hasPermission('hrm.employee', 'create')
       */
      hasPermission: (resource: string, action: string) => {
        const user = get().user;
        if (!user) return false;
        const permKey = `${resource}:${action}`;
        return user.permissions.includes(permKey) || user.permissions.includes('*');
      },

      /**
       * Check if current user has a specific role
       * e.g., hasRole('HR_Manager')
       */
      hasRole: (role: string) => {
        const user = get().user;
        if (!user) return false;
        return user.roles.includes(role) || user.roles.includes('SUPER_ADMIN');
      },
    }),
    {
      name: 'atlas-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
