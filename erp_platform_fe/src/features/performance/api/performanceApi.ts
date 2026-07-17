import { httpClient } from '@shared/api';
import type { PerformanceCycle, PerformanceGoal } from '../types';

export const performanceApi = {
  // Cycles
  async getCycles(): Promise<PerformanceCycle[]> {
    const { data } = await httpClient.get<PerformanceCycle[]>('/performance-cycles');
    return data;
  },

  async getCycleById(id: string): Promise<PerformanceCycle> {
    const { data } = await httpClient.get<PerformanceCycle>(`/performance-cycles/${id}`);
    return data;
  },

  async createCycle(payload: Partial<PerformanceCycle>): Promise<PerformanceCycle> {
    const { data } = await httpClient.post<PerformanceCycle>('/performance-cycles', payload);
    return data;
  },

  async updateCycle(id: string, payload: Partial<PerformanceCycle>): Promise<PerformanceCycle> {
    const { data } = await httpClient.patch<PerformanceCycle>(`/performance-cycles/${id}`, payload);
    return data;
  },

  async deleteCycle(id: string): Promise<void> {
    await httpClient.delete(`/performance-cycles/${id}`);
  },

  // Goals
  async getGoals(): Promise<PerformanceGoal[]> {
    const { data } = await httpClient.get<PerformanceGoal[]>('/performance-goals');
    return data;
  },

  async createGoal(payload: Partial<PerformanceGoal>): Promise<PerformanceGoal> {
    const { data } = await httpClient.post<PerformanceGoal>('/performance-goals', payload);
    return data;
  },
};
