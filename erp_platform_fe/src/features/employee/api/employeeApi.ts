import { createApiClient } from '@shared/api';
import { httpClient } from '@shared/api';
import type { Employee } from '../types';
import type { ListQueryParams } from '@shared/types';

/**
 * Employee API — Maps to backend EmployeeController
 *
 * Endpoints:
 *   GET    /employees          → list
 *   GET    /employees/:id      → getById
 *   POST   /employees          → create
 *   PATCH  /employees/:id      → update
 *   POST   /employees/:id/contacts           → syncContacts
 *   POST   /employees/:id/addresses           → syncAddresses
 *   POST   /employees/:id/emergency-contacts  → syncEmergencyContacts
 *   POST   /employees/:id/documents           → syncDocuments
 */

// Base CRUD operations
const baseApi = createApiClient<Employee>('/employees');

export const employeeApi = {
  ...baseApi,

  /** List employees with filtering */
  async list(_params?: ListQueryParams): Promise<Employee[]> {
    const { data } = await httpClient.get<Employee[]>('/employees');
    return data;
  },

  /** Sync employee contacts (bulk create/update/delete) */
  async syncContacts(employeeId: string, contacts: unknown[]) {
    const { data } = await httpClient.post(`/employees/${employeeId}/contacts`, { items: contacts });
    return data;
  },

  /** Sync employee addresses */
  async syncAddresses(employeeId: string, addresses: unknown[]) {
    const { data } = await httpClient.post(`/employees/${employeeId}/addresses`, { items: addresses });
    return data;
  },

  /** Sync emergency contacts */
  async syncEmergencyContacts(employeeId: string, contacts: unknown[]) {
    const { data } = await httpClient.post(`/employees/${employeeId}/emergency-contacts`, { items: contacts });
    return data;
  },

  /** Sync documents */
  async syncDocuments(employeeId: string, documents: unknown[]) {
    const { data } = await httpClient.post(`/employees/${employeeId}/documents`, { items: documents });
    return data;
  },

  /** Get list of Job Titles from backend */
  async getJobTitles(): Promise<{ id: string; name: string; code: string; isActive: boolean; createdAt: string }[]> {
    const { data } = await httpClient.get('/job-titles');
    return data;
  },

  /** Create a new job title */
  async createJobTitle(payload: { name: string; code: string; isActive?: boolean }): Promise<string> {
    const { data } = await httpClient.post<string>('/job-titles', payload);
    return data;
  },

  /** Update job title by ID */
  async updateJobTitle(id: string, payload: { name?: string; code?: string; isActive?: boolean }): Promise<void> {
    await httpClient.patch(`/job-titles/${id}`, payload);
  },

  /** Delete job title by ID */
  async deleteJobTitle(id: string): Promise<void> {
    await httpClient.delete(`/job-titles/${id}`);
  },
};
