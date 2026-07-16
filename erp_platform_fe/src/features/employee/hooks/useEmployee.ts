import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { employeeApi } from '../api/employeeApi';
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../types';
import type { ListQueryParams, ApiError } from '@shared/types';

/** Query key factory for employees */
const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params?: ListQueryParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

/**
 * useEmployees — List employees with pagination & filters
 *
 * Maps to: GET /api/v1/hrm/employees
 */
export function useEmployees(params?: ListQueryParams) {
  return useQuery<Employee[], ApiError>({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeApi.list(params),
  });
}

/**
 * useEmployee — Get single employee by ID
 *
 * Maps to: GET /api/v1/hrm/employees/:id
 */
export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id!),
    queryFn: () => employeeApi.getById(id!),
    enabled: Boolean(id),
  });
}

/**
 * useCreateEmployee — Create a new employee
 *
 * Maps to: POST /api/v1/hrm/employees
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeeApi.create(data as Partial<Employee>),
    onSuccess: () => {
      message.success('Tạo nhân viên thành công!');
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Tạo nhân viên thất bại');
    },
  });
}

/**
 * useUpdateEmployee — Update employee info
 *
 * Maps to: PATCH /api/v1/hrm/employees/:id
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
      employeeApi.update(id, data as Partial<Employee>),
    onSuccess: (_data, variables) => {
      message.success('Cập nhật thành công!');
      void queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Cập nhật thất bại');
    },
  });
}

/**
 * useDeleteEmployee — Soft delete employee
 *
 * Maps to: DELETE /api/v1/hrm/employees/:id
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),
    onSuccess: () => {
      message.success('Đã xóa nhân viên');
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error: ApiError) => {
      message.error(error.message || 'Xóa thất bại');
    },
  });
}
