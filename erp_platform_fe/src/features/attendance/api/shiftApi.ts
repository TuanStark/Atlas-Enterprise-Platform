import { httpClient } from '@shared/api';
import type { Shift, ShiftAssignment } from '../types';

export const shiftApi = {
  // Shifts CRUD
  async getShifts(): Promise<Shift[]> {
    const { data } = await httpClient.get<Shift[]>('/shifts');
    return data;
  },

  async createShift(payload: Partial<Shift>): Promise<Shift> {
    const { data } = await httpClient.post<Shift>('/shifts', payload);
    return data;
  },

  async updateShift(id: string, payload: Partial<Shift>): Promise<Shift> {
    const { data } = await httpClient.patch<Shift>(`/shifts/${id}`, payload);
    return data;
  },

  async deleteShift(id: string): Promise<void> {
    await httpClient.delete(`/shifts/${id}`);
  },

  // Shift Assignments
  async assignShift(employmentId: string, payload: { shiftId: string; effectiveFrom: string; effectiveTo?: string }): Promise<string> {
    const { data } = await httpClient.post<string>(`/employments/${employmentId}/shift-assignments`, payload);
    return data;
  },

  async getAssignments(employmentId: string): Promise<ShiftAssignment[]> {
    const { data } = await httpClient.get<ShiftAssignment[]>(`/employments/${employmentId}/shift-assignments`);
    return data;
  },
};
