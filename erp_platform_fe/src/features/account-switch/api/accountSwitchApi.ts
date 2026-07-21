import { httpClient } from '@shared/api';
import type { SwitchableUser, SwitchAccountRequest, SwitchAccountResponse } from '../types';

export const accountSwitchApi = {
  async listSwitchableUsers(): Promise<SwitchableUser[]> {
    const { data } = await httpClient.get<SwitchableUser[]>('/users/switchable');
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
