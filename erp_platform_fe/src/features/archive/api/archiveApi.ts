import { httpClient } from '@shared/api';
import type { ArchiveRecord, CreateArchiveRecordDto } from '../types';

export const archiveApi = {
  async create(data: CreateArchiveRecordDto): Promise<string> {
    const response = await httpClient.post<string>('/archives', data);
    return response.data;
  },

  async unarchive(id: string): Promise<void> {
    await httpClient.delete(`/archives/${id}`);
  },

  async getById(id: string): Promise<ArchiveRecord> {
    const response = await httpClient.get<ArchiveRecord>(`/archives/${id}`);
    return response.data;
  },

  async getAll(params?: {
    page?: number;
    pageSize?: number;
    sourceModule?: string;
    sourceEntity?: string;
  }): Promise<{ data: ArchiveRecord[]; total: number }> {
    const response = await httpClient.get<{ data: ArchiveRecord[]; total: number }>('/archives', {
      params,
    });
    return response.data;
  },
};
