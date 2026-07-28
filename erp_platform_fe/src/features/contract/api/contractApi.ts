import { createApiClient, httpClient } from '@shared/api';
import type { OffsetPaginatedResponse, ListQueryParams } from '@shared/types';
import type { Contract, CreateContractDto, CreateContractAnnexDto, UpdateContractDto, TerminateContractDto, SignContractDto } from '../types';

export const contractApi = {
  ...createApiClient<Contract>('/contracts'),

  /** Override getAll — contract backend uses offset-based pagination */
  async getAll(params?: ListQueryParams): Promise<OffsetPaginatedResponse<Contract>> {
    const { data } = await httpClient.get<OffsetPaginatedResponse<Contract>>('/contracts', { params });
    return data;
  },

  async create(data: CreateContractDto): Promise<string> {
    const response = await httpClient.post<string>('/contracts', data);
    return response.data;
  },

  async update(id: string, data: UpdateContractDto): Promise<void> {
    await httpClient.patch(`/contracts/${id}`, data);
  },

  async sign(id: string, data?: SignContractDto): Promise<void> {
    await httpClient.patch(`/contracts/${id}/sign`, data || { signedDate: new Date().toISOString() });
  },

  async terminate(id: string, data: TerminateContractDto): Promise<void> {
    await httpClient.patch(`/contracts/${id}/terminate`, data);
  },

  async deleteContract(id: string): Promise<void> {
    await httpClient.delete(`/contracts/${id}`);
  },

  async getByEmployment(employmentId: string): Promise<Contract[]> {
    const response = await httpClient.get<Contract[]>(`/contracts/employment/${employmentId}`);
    return response.data;
  },

  async addAnnex(contractId: string, data: CreateContractAnnexDto): Promise<string> {
    const response = await httpClient.post<string>(`/contracts/${contractId}/annexes`, data);
    return response.data;
  },

  async exportToExcel(params?: { status?: string }): Promise<Blob> {
    const response = await httpClient.get('/contracts/export', {
      params,
      responseType: 'blob',
    });
    return response.data as unknown as Blob;
  },
};
