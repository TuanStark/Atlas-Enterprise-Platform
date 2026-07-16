import { httpClient } from '@shared/api';
import type { AttendanceRecord, CheckInDto, CheckOutDto } from '../types';

export const attendanceApi = {
  /** List all attendance records */
  async listAll(): Promise<AttendanceRecord[]> {
    const { data } = await httpClient.get<AttendanceRecord[]>('/attendance/records');
    return data;
  },

  /** Log a check-in event */
  async checkIn(payload: CheckInDto): Promise<string> {
    const { data } = await httpClient.post<string>('/attendance/check-in', payload);
    return data;
  },

  /** Log a check-out event */
  async checkOut(recordId: string, payload: CheckOutDto): Promise<void> {
    await httpClient.post(`/attendance/records/${recordId}/check-out`, payload);
  },

  /** List attendance records for a specific employment */
  async listByEmployment(employmentId: string): Promise<AttendanceRecord[]> {
    const { data } = await httpClient.get<AttendanceRecord[]>(`/employments/${employmentId}/attendance-records`);
    return data;
  },
};
