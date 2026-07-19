/**
 * Shared API Types — Maps to Backend Result pattern and pagination
 */

/** Standard API response wrapper from backend ResultTransformInterceptor */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  code?: string;
}

/** Error response following RFC 7807 Problem Details */
export interface ApiError {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  errorCode?: string;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
  invalidParams?: Array<{
    name: string;
    reason: string;
  }>;
}

/** Cursor-based pagination response from backend */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

/** Query params for list endpoints */
export interface ListQueryParams {
  limit?: number;
  startingAfter?: string;
  sort?: string;
  filter?: Record<string, unknown>;
  search?: string;
}

/** Login request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Login response from backend */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    principalId: string;
    username: string;
    email: string;
    displayName: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
  };
}

/** Refresh token request */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** Generic ID type */
export type UUID = string;

/** Reset password request */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

