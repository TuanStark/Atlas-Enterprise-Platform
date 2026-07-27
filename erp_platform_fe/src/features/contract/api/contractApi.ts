import { createApiClient, httpClient } from '@shared/api';
import type { Contract, CreateContractDto, CreateContractAnnexDto } from '../types';

export const contractApi = {
  ...createApiClient<Contract>('/contracts'),

  async create(data: CreateContractDto): Promise<string> {
    const response = await httpClient.post<string>('/contracts', data);
    return response.data;
  },

  async sign(id: string): Promise<void> {
    await httpClient.patch(`/contracts/${id}/sign`);
  },

  async getByEmployment(employmentId: string): Promise<Contract[]> {
    const response = await httpClient.get<Contract[]>(`/contracts/employment/${employmentId}`);
    return response.data;
  },

  async addAnnex(contractId: string, data: CreateContractAnnexDto): Promise<string> {
    const response = await httpClient.post<string>(`/contracts/${contractId}/annexes`, data);
    return response.data;
  }
};
