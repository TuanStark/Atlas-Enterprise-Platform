import { httpClient, createApiClient } from '@shared/api';
import type { LeaveRequest, LeaveType, LeaveBalance, CreateLeaveRequestDto } from '../types';

const baseRequestApi = createApiClient<LeaveRequest>('/leave-requests');

export const leaveApi = {
  ...baseRequestApi,

  /** List all leave requests */
  async listRequests(): Promise<LeaveRequest[]> {
    const { data } = await httpClient.get<LeaveRequest[]>('/leave-requests');
    return data;
  },

  /** Approve a leave request */
  async approve(id: string): Promise<void> {
    await httpClient.patch(`/leave-requests/${id}/approve`);
  },

  /** Reject a leave request */
  async reject(id: string, reason?: string): Promise<void> {
    await httpClient.patch(`/leave-requests/${id}/reject`, { reason });
  },

  /** List all leave types */
  async listTypes(): Promise<LeaveType[]> {
    const { data } = await httpClient.get<LeaveType[]>('/leave-types');
    return data;
  },

  /** List leave balances for a specific employment */
  async listBalances(employmentId: string): Promise<LeaveBalance[]> {
    const { data } = await httpClient.get<LeaveBalance[]>(`/employments/${employmentId}/leave-balances`);
    return data;
  },
};
