/**
 * RBAC Types — Maps to backend Role, Permission, Resource, Action, PrincipalRole entities
 *
 * Follows the AWS IAM model: Permission = Resource:Action
 */

export interface Resource {
  id: string;
  code: string;
  name?: string;
}

export interface Action {
  id: string;
  code: string;
  name?: string;
}

export interface PermissionGroup {
  id: string;
  code: string;
  name?: string;
}

export interface Permission {
  id: string;
  permissionGroupId?: string;
  resourceId: string;
  actionId: string;
  code: string;
  description?: string;
  resource?: Resource;
  action?: Action;
  permissionGroup?: PermissionGroup;
}

export interface Role {
  id: string;
  tenantId: string;
  code?: string;
  name?: string;
  description?: string;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
  rolePermissions?: RolePermission[];
  principalRoles?: PrincipalRole[];
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  effect?: 'allow' | 'deny';
  permission?: Permission;
}

export interface PrincipalRole {
  principalId: string;
  roleId: string;
  scopeId: string;
  assignedAt?: string;
  role?: Role;
  scope?: Scope;
  principal?: {
    id: string;
    displayName?: string;
    type?: string;
    user?: {
      id: string;
      username: string;
      email: string;
    };
  };
}

export interface Scope {
  id: string;
  code?: string;
  name?: string;
}

export interface CreateRoleDto {
  tenantId: string;
  code: string;
  name: string;
  description?: string;
}

export interface AssignPermissionDto {
  permissionId: string;
}

export interface AssignRoleDto {
  roleId: string;
  scopeId: string;
}

/** User management types — combines Principal + User models */
export interface ManagedUser {
  id: string;
  principalId: string;
  username: string;
  email: string;
  displayName?: string;
  phone?: string;
  emailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  principal?: {
    id: string;
    type: string;
    status: string;
    displayName?: string;
    principalRoles?: PrincipalRole[];
  };
}

/** Audit log types */
export interface AuditLog {
  id: string;
  tenantId: string;
  targetModule?: string;
  targetEntity?: string;
  targetRecordId?: string;
  action?: string;
  actorPrincipalId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  actorPrincipal?: {
    id: string;
    displayName?: string;
    user?: {
      username: string;
      email: string;
    };
  };
  auditDetails?: AuditDetail[];
}

export interface AuditDetail {
  id: string;
  auditLogId: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
}
