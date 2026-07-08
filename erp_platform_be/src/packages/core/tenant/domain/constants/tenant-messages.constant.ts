export enum TenantErrorCode {
  CODE_ALREADY_EXISTS = 'TENANT_CODE_ALREADY_EXISTS',
  NOT_FOUND = 'TENANT_NOT_FOUND',
}

export enum TenantSuccessCode {
  CREATED = 'TENANT_CREATED',
  UPDATED = 'TENANT_UPDATED',
  ACTIVATED = 'TENANT_ACTIVATED',
  DEACTIVATED = 'TENANT_DEACTIVATED',
  DELETED = 'TENANT_DELETED',
}

export const TenantMessages = {
  ERROR: {
    CODE_ALREADY_EXISTS: 'Tenant code already exists.',
    NOT_FOUND: 'Tenant not found.',
  },
  SUCCESS: {
    CREATED: 'Tenant created successfully.',
    UPDATED: 'Tenant updated successfully.',
    ACTIVATED: 'Tenant activated successfully.',
    DEACTIVATED: 'Tenant deactivated successfully.',
    DELETED: 'Tenant deleted successfully.',
  },
} as const;
