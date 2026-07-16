import { httpClient } from './httpClient';
import type { PaginatedResponse, ListQueryParams } from '@shared/types';

/**
 * Generic CRUD API Factory
 *
 * Creates type-safe API functions for any resource endpoint.
 * Maps to backend's RESTful API pattern: /api/v1/<module>/<resource>
 *
 * Usage:
 *   const employeeApi = createApiClient<Employee>('/hrm/employees');
 *   const employees = await employeeApi.getAll({ limit: 20 });
 *   const employee = await employeeApi.getById('uuid');
 */
export function createApiClient<T>(basePath: string) {
  return {
    /** GET /<basePath> — List with cursor pagination */
    async getAll(params?: ListQueryParams): Promise<PaginatedResponse<T>> {
      const queryParams: Record<string, string> = {};

      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.startingAfter) queryParams.starting_after = params.startingAfter;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.search) queryParams.search = params.search;
      if (params?.filter) queryParams.filter = JSON.stringify(params.filter);

      const { data } = await httpClient.get<PaginatedResponse<T>>(basePath, {
        params: queryParams,
      });
      return data;
    },

    /** GET /<basePath>/:id — Get single resource */
    async getById(id: string): Promise<T> {
      const { data } = await httpClient.get<T>(`${basePath}/${id}`);
      return data;
    },

    /** POST /<basePath> — Create resource */
    async create(payload: Partial<T>): Promise<T> {
      const { data } = await httpClient.post<T>(basePath, payload);
      return data;
    },

    /** PATCH /<basePath>/:id — Update resource */
    async update(id: string, payload: Partial<T>): Promise<T> {
      const { data } = await httpClient.patch<T>(`${basePath}/${id}`, payload);
      return data;
    },

    /** DELETE /<basePath>/:id — Soft delete resource */
    async remove(id: string): Promise<void> {
      await httpClient.delete(`${basePath}/${id}`);
    },

    /** POST /<basePath>/:id/<action> — Execute action on resource */
    async executeAction<R = unknown>(
      id: string,
      action: string,
      payload?: unknown,
    ): Promise<R> {
      const { data } = await httpClient.post<R>(
        `${basePath}/${id}/${action}`,
        payload,
      );
      return data;
    },
  };
}
