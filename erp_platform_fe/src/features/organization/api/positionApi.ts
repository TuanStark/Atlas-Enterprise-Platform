import { httpClient } from '@shared/api';
import type { Position, CreatePositionDto, UpdatePositionDto } from '../types';

export const positionApi = {
  async getPositions(orgId: string): Promise<Position[]> {
    const { data } = await httpClient.get<Position[]>(`/organizations/${orgId}/positions`);
    return data;
  },

  async createPosition(orgId: string, payload: CreatePositionDto): Promise<string> {
    const { data } = await httpClient.post<string>(`/organizations/${orgId}/positions`, payload);
    return data;
  },

  async updatePosition(orgId: string, id: string, payload: UpdatePositionDto): Promise<void> {
    await httpClient.patch(`/organizations/${orgId}/positions/${id}`, payload);
  },

  async deletePosition(orgId: string, id: string): Promise<void> {
    await httpClient.delete(`/organizations/${orgId}/positions/${id}`);
  },
};
