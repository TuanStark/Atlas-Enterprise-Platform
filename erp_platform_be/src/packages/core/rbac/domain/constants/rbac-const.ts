export enum RbacErrorCode {
  PERMISSION_ALREADY_EXISTS = 'PERMISSION_ALREADY_EXISTS',
  PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',
}

export enum RbacSuccessCode {
  PERMISSION_CREATED = 'PERMISSION_CREATED',
  PERMISSION_UPDATED = 'PERMISSION_UPDATED',
  PERMISSION_DELETED = 'PERMISSION_DELETED',
}

export const RbacMessages = {
  SUCCESS: {
    PERMISSION_CREATED: 'Permission created successfully.',
    PERMISSION_UPDATED: 'Permission updated successfully.',
    PERMISSION_DELETED: 'Permission deleted successfully.',
  },
  ERROR: {
    PERMISSION_ALREADY_EXISTS: 'Permission already exists.',
    PERMISSION_NOT_FOUND: 'Permission not found.',
  },
};
