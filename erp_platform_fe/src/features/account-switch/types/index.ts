export interface SwitchableUser {
  principalId: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  roles: string[];
}

export interface PaginatedSwitchableUsersResponse {
  items: SwitchableUser[];
  total: number;
  hasMore: boolean;
}

export interface SwitchAccountRequest {
  targetPrincipalId: string;
}

export interface SwitchAccountResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
