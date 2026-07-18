import { httpClient } from '@shared/api';
import type {
  Role,
  Permission,
  ManagedUser,
  AuditLog,
  PrincipalRole,
  CreateRoleDto,
  AssignRoleDto,
  AssignPermissionDto,
} from '../types';

/**
 * RBAC API — Maps to backend RoleController, PermissionController, PrincipalRoleController
 *
 * Endpoints:
 *   GET    /roles                                → listRoles
 *   GET    /roles/:id                            → getRole
 *   POST   /roles                                → createRole
 *   POST   /roles/:roleId/permissions            → assignPermissionToRole
 *   GET    /permissions                           → listPermissions
 *   GET    /principals/:principalId/roles         → listPrincipalRoles
 *   POST   /principals/:principalId/roles         → assignRoleToPrincipal
 *   DELETE /principals/:pid/roles/:rid/scopes/:sid → removeRoleFromPrincipal
 *   GET    /users                                 → listUsers
 *   GET    /audit-logs                            → listAuditLogs
 */
export const rbacApi = {
  // --- Roles ---
  async listRoles(tenantId: string): Promise<Role[]> {
    const { data } = await httpClient.get<Role[]>('/roles', { params: { tenantId } });
    return data;
  },

  async getRole(id: string): Promise<Role> {
    const { data } = await httpClient.get<Role>(`/roles/${id}`);
    return data;
  },

  async createRole(dto: CreateRoleDto): Promise<void> {
    await httpClient.post('/roles', dto);
  },

  async assignPermissionToRole(roleId: string, dto: AssignPermissionDto): Promise<void> {
    await httpClient.post(`/roles/${roleId}/permissions`, dto);
  },

  // --- Permissions ---
  async listPermissions(): Promise<Permission[]> {
    const { data } = await httpClient.get<Permission[]>('/permissions');
    return data;
  },

  // --- Principal Roles ---
  async listPrincipalRoles(principalId: string): Promise<PrincipalRole[]> {
    const { data } = await httpClient.get<PrincipalRole[]>(`/principals/${principalId}/roles`);
    return data;
  },

  async assignRoleToPrincipal(principalId: string, dto: AssignRoleDto): Promise<void> {
    await httpClient.post(`/principals/${principalId}/roles`, dto);
  },

  async removeRoleFromPrincipal(principalId: string, roleId: string, scopeId: string): Promise<void> {
    await httpClient.delete(`/principals/${principalId}/roles/${roleId}/scopes/${scopeId}`);
  },

  // --- Users ---
  async listUsers(): Promise<ManagedUser[]> {
    const { data } = await httpClient.get<any>('/users');
    return Array.isArray(data) ? data : (data?.items || []);
  },

  // --- Audit Logs ---
  async listAuditLogs(params?: { module?: string; action?: string; limit?: number }): Promise<AuditLog[]> {
    const { data } = await httpClient.get<AuditLog[]>('/audit-logs', { params });
    return data;
  },
};
