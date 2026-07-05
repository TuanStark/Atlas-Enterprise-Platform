export enum TenantErrorCode {
  CODE_ALREADY_EXISTS = 'TENANT_CODE_ALREADY_EXISTS',
}

export enum TenantSuccessCode {
  CREATED = 'TENANT_CREATED',
}

export const TenantMessages = {
  ERROR: {
    CODE_ALREADY_EXISTS: 'Tenant code already exists.',
  },
  SUCCESS: {
    CREATED: 'Tenant created successfully.',
  },
} as const;
