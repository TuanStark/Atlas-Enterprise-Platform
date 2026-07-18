/**
 * Auth Types — Maps to backend Principal + User entities
 */

export interface AuthUser {
  id: string;
  principalId: string;
  username: string;
  email: string;
  displayName: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  tenant?: {
    id: string;
    code: string;
    name: string;
    status: string;
    logoFileId?: string;
  } | null;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
}
