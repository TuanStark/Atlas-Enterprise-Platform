import { httpClient } from '@shared/api';
import type { LoginRequest, LoginResponse, RefreshTokenRequest } from '@shared/types';

/**
 * Auth API — Maps to backend AuthController
 * POST /auth/login
 * POST /auth/refresh
 * POST /auth/logout
 */
export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  async refreshToken(payload: RefreshTokenRequest): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>('/auth/refresh', payload);
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await httpClient.post('/auth/logout', { refreshToken });
  },
};
