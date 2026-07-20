export class RolePermissionDto {
  permissionId: string;
  effect?: string;
}

export class PrincipalRoleSummaryDto {
  principalId: string;
  roleId: string;
  scopeId: string;
  assignedAt?: string;
}

export class RoleDto {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
  rolePermissions: RolePermissionDto[];
  principalRoles?: PrincipalRoleSummaryDto[];
}
