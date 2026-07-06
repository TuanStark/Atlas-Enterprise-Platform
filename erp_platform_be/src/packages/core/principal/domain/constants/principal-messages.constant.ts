export enum PrincipalErrorCode {
  NOT_FOUND = 'PRINCIPAL_NOT_FOUND',
}

export enum PrincipalSuccessCode {
  CREATED = 'PRINCIPAL_CREATED',
  UPDATED = 'PRINCIPAL_UPDATED',
  ACTIVATED = 'PRINCIPAL_ACTIVATED',
  SUSPENDED = 'PRINCIPAL_SUSPENDED',
  FOUND = 'PRINCIPAL_FOUND',
  LIST_SUCCESS = 'PRINCIPAL_LIST_SUCCESS',
}

export const PrincipalMessages = {
  ERROR: {
    NOT_FOUND: 'Principal not found.',
  },
  SUCCESS: {
    CREATED: 'Principal created successfully.',
    UPDATED: 'Principal updated successfully.',
    ACTIVATED: 'Principal activated successfully.',
    SUSPENDED: 'Principal suspended successfully.',
    FOUND: 'Principal retrieved successfully.',
    LIST_SUCCESS: 'Principals list retrieved successfully.',
  },
} as const;
