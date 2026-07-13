export enum RbacErrorCode {
  PERMISSION_ALREADY_EXISTS = 'PERMISSION_ALREADY_EXISTS',
  PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',
  ROLE_ALREADY_EXISTS = 'ROLE_ALREADY_EXISTS',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  PRINCIPAL_ROLE_ALREADY_ASSIGNED = 'PRINCIPAL_ROLE_ALREADY_ASSIGNED',
  PRINCIPAL_ROLE_NOT_FOUND = 'PRINCIPAL_ROLE_NOT_FOUND',
}

export enum RbacSuccessCode {
  PERMISSION_CREATED = 'PERMISSION_CREATED',
  PERMISSION_UPDATED = 'PERMISSION_UPDATED',
  PERMISSION_DELETED = 'PERMISSION_DELETED',
  ROLE_CREATED = 'ROLE_CREATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_DELETED = 'ROLE_DELETED',
  PRINCIPAL_ROLE_ASSIGNED = 'PRINCIPAL_ROLE_ASSIGNED',
  PRINCIPAL_ROLE_REMOVED = 'PRINCIPAL_ROLE_REMOVED',
}

export const RbacMessages = {
  SUCCESS: {
    PERMISSION_CREATED: 'Permission created successfully.',
    PERMISSION_UPDATED: 'Permission updated successfully.',
    PERMISSION_DELETED: 'Permission deleted successfully.',
    ROLE_CREATED: 'Role created successfully.',
    ROLE_UPDATED: 'Role updated successfully.',
    ROLE_DELETED: 'Role deleted successfully.',
    PRINCIPAL_ROLE_ASSIGNED: 'Role assigned to principal successfully.',
    PRINCIPAL_ROLE_REMOVED: 'Role removed from principal successfully.',
  },
  ERROR: {
    PERMISSION_ALREADY_EXISTS: 'Permission already exists.',
    PERMISSION_NOT_FOUND: 'Permission not found.',
    ROLE_ALREADY_EXISTS: 'Role already exists.',
    ROLE_NOT_FOUND: 'Role not found.',
    PRINCIPAL_ROLE_ALREADY_ASSIGNED: 'Role is already assigned to this principal.',
    PRINCIPAL_ROLE_NOT_FOUND: 'Principal role assignment not found.',
  },
};
