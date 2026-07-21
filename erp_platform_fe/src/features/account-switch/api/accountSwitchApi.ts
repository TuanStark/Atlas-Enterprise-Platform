import { httpClient } from '@shared/api';
import type {
  PaginatedSwitchableUsersResponse,
  SwitchAccountRequest,
  SwitchAccountResponse,
} from '../types';

export const accountSwitchApi = {
  async listSwitchableUsers(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedSwitchableUsersResponse> {
    const { data } = await httpClient.get<PaginatedSwitchableUsersResponse>('/users/switchable', {
      params,
    });
    return data;
  },

  async switchAccount(payload: SwitchAccountRequest): Promise<SwitchAccountResponse> {
    const { data } = await httpClient.post<SwitchAccountResponse>('/auth/switch-account', payload);
    return data;
  },

  async endImpersonation(): Promise<SwitchAccountResponse> {
    const { data } = await httpClient.post<SwitchAccountResponse>('/auth/end-impersonation');
    return data;
  },
};
